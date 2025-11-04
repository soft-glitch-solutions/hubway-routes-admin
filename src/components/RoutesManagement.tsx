
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Route, Plus, Edit, Trash2, Search } from 'lucide-react';
import RouteForm from './RouteForm';

interface RouteData {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
  transport_type: string;
  cost: number;
  hub_id: string | null;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

const RoutesManagement = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [transportTypeFilter, setTransportTypeFilter] = useState('all');
  const [hubFilter, setHubFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes((data as any) || []);
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
    setIsEditOpen(true);
  };

  const handleFormSuccess = () => {
    fetchRoutes();
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setSelectedRoute(null);
  };

  const filteredRoutes = routes
    .filter(route => {
      const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.start_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.end_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.transport_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTransportType = transportTypeFilter === 'all' || route.transport_type === transportTypeFilter;
      const matchesHub = hubFilter === 'all' || 
        (hubFilter === 'with_hub' && route.hub_id) || 
        (hubFilter === 'no_hub' && !route.hub_id);
      
      return matchesSearch && matchesTransportType && matchesHub;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cost':
          return a.cost - b.cost;
        case 'transport_type':
          return a.transport_type.localeCompare(b.transport_type);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Detect potential duplicates
  const getDuplicateInfo = (route: RouteData) => {
    const duplicates = routes.filter(r => 
      r.id !== route.id &&
      r.start_point === route.start_point &&
      r.end_point === route.end_point &&
      r.transport_type === route.transport_type
    );
    return duplicates.length > 0 ? duplicates.length : null;
  };

  const uniqueTransportTypes = Array.from(new Set(routes.map(r => r.transport_type).filter(Boolean)));

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
          <RouteForm 
            onSuccess={handleFormSuccess}
            onCancel={() => setIsCreateOpen(false)}
          />
        </Dialog>
      </div>

      <div className="flex flex-col gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Transport Type</Label>
            <Select value={transportTypeFilter} onValueChange={setTransportTypeFilter}>
              <SelectTrigger className="transport-input">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTransportTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hub Association</Label>
            <Select value={hubFilter} onValueChange={setHubFilter}>
              <SelectTrigger className="transport-input">
                <SelectValue placeholder="All Routes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                <SelectItem value="with_hub">With Hub</SelectItem>
                <SelectItem value="no_hub">No Hub</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="transport-input">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="cost">Cost (Low to High)</SelectItem>
                <SelectItem value="transport_type">Transport Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          filteredRoutes.map((route) => {
            const duplicateCount = getDuplicateInfo(route);
            return (
            <Card key={route.id} className={`transport-card hover:shadow-xl transition-all duration-200 ${duplicateCount ? 'border-l-4 border-l-warning' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl text-foreground">{route.name}</CardTitle>
                      {duplicateCount && (
                        <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full">
                          {duplicateCount} potential duplicate{duplicateCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
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
                {route.instructions && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-muted-foreground text-sm mb-1">Special Instructions</p>
                    <p className="text-sm">{route.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <RouteForm 
          route={selectedRoute}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsEditOpen(false)}
        />
      </Dialog>
    </div>
  );
};

export default RoutesManagement;
