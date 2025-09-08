import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link, MapPin, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Hub {
  id: string;
  name: string;
  address: string;
  transport_type: string;
}

interface RouteData {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
  transport_type: string;
  cost: number;
  hub_id: string | null;
}

interface HubWithRoutes extends Hub {
  routes: RouteData[];
}

const HubRoutesManagement = () => {
  const [hubs, setHubs] = useState<HubWithRoutes[]>([]);
  const [unassignedRoutes, setUnassignedRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHubId, setSelectedHubId] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHubRouteData();
  }, []);

  const fetchHubRouteData = async () => {
    try {
      // Fetch all hubs
      const { data: hubsData, error: hubsError } = await supabase
        .from('hubs')
        .select('*')
        .order('name');

      if (hubsError) throw hubsError;

      // Fetch all routes
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .order('name');

      if (routesError) throw routesError;

      // Group routes by hub
      const hubsWithRoutes: HubWithRoutes[] = (hubsData || []).map(hub => ({
        ...hub,
        routes: (routesData || []).filter(route => route.hub_id === hub.id)
      }));

      // Get unassigned routes
      const unassigned = (routesData || []).filter(route => !route.hub_id);

      setHubs(hubsWithRoutes);
      setUnassignedRoutes(unassigned);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hub and route data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRoute = async () => {
    if (!selectedHubId || !selectedRouteId) return;

    try {
      const { error } = await supabase
        .from('routes')
        .update({ hub_id: selectedHubId })
        .eq('id', selectedRouteId);

      if (error) throw error;

      await fetchHubRouteData();
      setIsAssignDialogOpen(false);
      setSelectedHubId('');
      setSelectedRouteId('');
      
      toast({
        title: "Success",
        description: "Route assigned to hub successfully.",
      });
    } catch (error) {
      console.error('Error assigning route:', error);
      toast({
        title: "Error",
        description: "Failed to assign route to hub.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRoute = async (routeId: string) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({ hub_id: null })
        .eq('id', routeId);

      if (error) throw error;

      await fetchHubRouteData();
      
      toast({
        title: "Success",
        description: "Route removed from hub successfully.",
      });
    } catch (error) {
      console.error('Error removing route:', error);
      toast({
        title: "Error",
        description: "Failed to remove route from hub.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded-lg w-64"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl"></div>
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
            <Link className="w-8 h-8 text-primary" />
            Hub Routes Management
          </h1>
          <p className="text-muted-foreground">Manage relationships between hubs and routes</p>
        </div>
        
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button className="transport-button-primary" disabled={unassignedRoutes.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Route to Hub
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Route to Hub</DialogTitle>
              <DialogDescription>
                Select a hub and an unassigned route to create the relationship
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="hub-select" className="text-sm font-medium">Select Hub</label>
                <Select value={selectedHubId} onValueChange={setSelectedHubId}>
                  <SelectTrigger className="transport-input">
                    <SelectValue placeholder="Choose a hub" />
                  </SelectTrigger>
                  <SelectContent>
                    {hubs.map((hub) => (
                      <SelectItem key={hub.id} value={hub.id}>
                        {hub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="route-select" className="text-sm font-medium">Select Route</label>
                <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                  <SelectTrigger className="transport-input">
                    <SelectValue placeholder="Choose a route" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedRoutes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} ({route.start_point} → {route.end_point})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAssignRoute}
                  disabled={!selectedHubId || !selectedRouteId}
                  className="transport-button-primary flex-1"
                >
                  Assign Route
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAssignDialogOpen(false)}
                  className="transport-button-secondary flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Unassigned Routes Section */}
      {unassignedRoutes.length > 0 && (
        <Card className="transport-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              Unassigned Routes ({unassignedRoutes.length})
            </CardTitle>
            <CardDescription>Routes that are not linked to any hub</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unassignedRoutes.map((route) => (
                <Badge key={route.id} variant="secondary" className="px-3 py-2 text-sm">
                  {route.name} - {route.transport_type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hubs with Routes */}
      <div className="grid gap-6">
        {hubs.map((hub) => (
          <Card key={hub.id} className="transport-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {hub.name}
                  </CardTitle>
                  <CardDescription>{hub.address}</CardDescription>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Transport Type: {hub.transport_type || 'Not specified'}</span>
                    <span>Routes: {hub.routes.length}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hub.routes.length === 0 ? (
                <p className="text-muted-foreground italic">No routes assigned to this hub</p>
              ) : (
                <div className="space-y-3">
                  {hub.routes.map((route) => (
                    <div 
                      key={route.id} 
                      className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{route.name}</h4>
                          <Badge variant="outline" className="transport-badge-route">
                            {route.transport_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {route.start_point} → {route.end_point}
                        </p>
                        <p className="text-sm font-medium mt-1">Cost: R{route.cost}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRoute(route.id)}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {hubs.length === 0 && (
        <Card className="transport-card">
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No hubs available. Create some hubs first to manage route relationships.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HubRoutesManagement;