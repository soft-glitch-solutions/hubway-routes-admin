import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Route, Plus, Edit, Trash2, Search } from 'lucide-react';

interface RouteData {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
  transport_type: string;
  cost: number;
  hub_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Hub {
  id: string;
  name: string;
}

const RoutesManagement = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_point: '',
    end_point: '',
    transport_type: '',
    cost: '',
    hub_id: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRoutes();
    fetchHubs();
  }, []);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch routes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHubs = async () => {
    try {
      const { data, error } = await supabase
        .from('hubs')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setHubs(data || []);
    } catch (error) {
      console.error('Error fetching hubs:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('routes')
        .insert({
          name: formData.name,
          start_point: formData.start_point,
          end_point: formData.end_point,
          transport_type: formData.transport_type,
          cost: parseFloat(formData.cost),
          hub_id: formData.hub_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      setRoutes([data, ...routes]);
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Route created successfully.",
      });
    } catch (error) {
      console.error('Error creating route:', error);
      toast({
        title: "Error",
        description: "Failed to create route.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;

    try {
      const { data, error } = await supabase
        .from('routes')
        .update({
          name: formData.name,
          start_point: formData.start_point,
          end_point: formData.end_point,
          transport_type: formData.transport_type,
          cost: parseFloat(formData.cost),
          hub_id: formData.hub_id || null,
        })
        .eq('id', selectedRoute.id)
        .select()
        .single();

      if (error) throw error;

      setRoutes(routes.map(route => route.id === selectedRoute.id ? data : route));
      setIsEditOpen(false);
      setSelectedRoute(null);
      resetForm();
      toast({
        title: "Success",
        description: "Route updated successfully.",
      });
    } catch (error) {
      console.error('Error updating route:', error);
      toast({
        title: "Error",
        description: "Failed to update route.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);

      if (error) throw error;

      setRoutes(routes.filter(route => route.id !== routeId));
      toast({
        title: "Success",
        description: "Route deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({
        title: "Error",
        description: "Failed to delete route.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (route: RouteData) => {
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      start_point: route.start_point,
      end_point: route.end_point,
      transport_type: route.transport_type,
      cost: route.cost.toString(),
      hub_id: route.hub_id || '',
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      start_point: '',
      end_point: '',
      transport_type: '',
      cost: '',
      hub_id: '',
    });
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.start_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.end_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.transport_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded-lg w-64"></div>
        <div className="h-12 bg-muted rounded-lg"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Route className="w-8 h-8 text-transport-route" />
            Routes Management
          </h1>
          <p className="text-muted-foreground">Manage transport routes and connections</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="transport-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Route</DialogTitle>
              <DialogDescription>
                Add a new transport route to the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="transport-input"
                  placeholder="e.g., City Center to Airport"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_point">Start Point</Label>
                  <Input
                    id="start_point"
                    value={formData.start_point}
                    onChange={(e) => setFormData({...formData, start_point: e.target.value})}
                    required
                    className="transport-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_point">End Point</Label>
                  <Input
                    id="end_point"
                    value={formData.end_point}
                    onChange={(e) => setFormData({...formData, end_point: e.target.value})}
                    required
                    className="transport-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transport_type">Transport Type</Label>
                <Select value={formData.transport_type} onValueChange={(value) => setFormData({...formData, transport_type: value})}>
                  <SelectTrigger className="transport-input">
                    <SelectValue placeholder="Select transport type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Taxi">Taxi</SelectItem>
                    <SelectItem value="Train">Train</SelectItem>
                    <SelectItem value="Metro">Metro</SelectItem>
                    <SelectItem value="Shuttle">Shuttle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    required
                    className="transport-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hub_id">Associated Hub (Optional)</Label>
                  <Select value={formData.hub_id} onValueChange={(value) => setFormData({...formData, hub_id: value})}>
                    <SelectTrigger className="transport-input">
                      <SelectValue placeholder="Select hub" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No hub</SelectItem>
                      {hubs.map((hub) => (
                        <SelectItem key={hub.id} value={hub.id}>
                          {hub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="transport-button-primary flex-1">
                  Create Route
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  className="transport-button-secondary flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transport-input"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRoutes.length === 0 ? (
          <Card className="transport-card">
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {searchTerm ? 'No routes found matching your search.' : 'No routes available. Create your first route!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRoutes.map((route) => (
            <Card key={route.id} className="transport-card hover:shadow-xl transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-foreground">{route.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {route.start_point} → {route.end_point}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="transport-badge-route">{route.transport_type}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(route)}
                      className="transport-button-secondary"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(route.id)}
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cost</p>
                    <p className="font-medium">R{route.cost}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hub Associated</p>
                    <p className="font-medium">{route.hub_id ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(route.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>
              Update route information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Route Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="transport-input"
                placeholder="e.g., City Center to Airport"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start_point">Start Point</Label>
                <Input
                  id="edit-start_point"
                  value={formData.start_point}
                  onChange={(e) => setFormData({...formData, start_point: e.target.value})}
                  required
                  className="transport-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end_point">End Point</Label>
                <Input
                  id="edit-end_point"
                  value={formData.end_point}
                  onChange={(e) => setFormData({...formData, end_point: e.target.value})}
                  required
                  className="transport-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-transport_type">Transport Type</Label>
              <Select value={formData.transport_type} onValueChange={(value) => setFormData({...formData, transport_type: value})}>
                <SelectTrigger className="transport-input">
                  <SelectValue placeholder="Select transport type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Taxi">Taxi</SelectItem>
                  <SelectItem value="Train">Train</SelectItem>
                  <SelectItem value="Metro">Metro</SelectItem>
                  <SelectItem value="Shuttle">Shuttle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Cost</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  required
                  className="transport-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hub_id">Associated Hub (Optional)</Label>
                <Select value={formData.hub_id} onValueChange={(value) => setFormData({...formData, hub_id: value})}>
                  <SelectTrigger className="transport-input">
                    <SelectValue placeholder="Select hub" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No hub</SelectItem>
                    {hubs.map((hub) => (
                      <SelectItem key={hub.id} value={hub.id}>
                        {hub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="transport-button-primary flex-1">
                Update Route
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                className="transport-button-secondary flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoutesManagement;
