import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Search, Eye, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const { toast } = useToast();
  const [hubs, setHubs] = useState<HubWithRoutes[]>([]);
  const [unassignedRoutes, setUnassignedRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHub, setSelectedHub] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [hubSearch, setHubSearch] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  const [selectedHubDetails, setSelectedHubDetails] = useState<HubWithRoutes | null>(null);

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
    if (!selectedHub || !selectedRoute) return;

    try {
      const { error } = await supabase
        .from('routes')
        .update({ hub_id: selectedHub })
        .eq('id', selectedRoute);

      if (error) throw error;

      await fetchHubRouteData();
      setSelectedHub('');
      setSelectedRoute('');
      
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

  const filteredHubs = hubs.filter(hub =>
    hub.name.toLowerCase().includes(hubSearch.toLowerCase()) ||
    hub.address?.toLowerCase().includes(hubSearch.toLowerCase())
  );

  const filteredUnassignedRoutes = unassignedRoutes.filter(route =>
    route.name.toLowerCase().includes(routeSearch.toLowerCase()) ||
    route.start_point.toLowerCase().includes(routeSearch.toLowerCase()) ||
    route.end_point.toLowerCase().includes(routeSearch.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hub Routes Management</h1>
        <p className="text-muted-foreground">Manage routes assigned to each hub</p>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hub-search">Search Hubs</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="hub-search"
                placeholder="Search hubs..."
                value={hubSearch}
                onChange={(e) => setHubSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="route-search">Search Routes</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="route-search"
                placeholder="Search routes..."
                value={routeSearch}
                onChange={(e) => setRouteSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assign Route to Hub */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Route to Hub</CardTitle>
          <CardDescription>Select a hub and route to create the assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Hub</Label>
              <Select value={selectedHub} onValueChange={setSelectedHub}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a hub" />
                </SelectTrigger>
                <SelectContent>
                  {filteredHubs.map((hub) => (
                    <SelectItem key={hub.id} value={hub.id}>
                      {hub.name} - {hub.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unassigned Route</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an unassigned route" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUnassignedRoutes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name} ({route.start_point} → {route.end_point})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAssignRoute} disabled={!selectedHub || !selectedRoute}>
            Assign Route to Hub
          </Button>
        </CardContent>
      </Card>

      {/* Unassigned Routes */}
      {filteredUnassignedRoutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Routes ({unassignedRoutes.length})</CardTitle>
            <CardDescription>Routes that are not assigned to any hub</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filteredUnassignedRoutes.map((route) => (
                <Badge key={route.id} variant="secondary">
                  {route.name} ({route.start_point} → {route.end_point})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hubs List with Details View */}
      <div className="space-y-4">
        {filteredHubs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No hubs found</p>
            </CardContent>
          </Card>
        ) : (
          filteredHubs.map((hub) => (
            <Card key={hub.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {hub.name}
                    <Badge variant="outline">{hub.transport_type}</Badge>
                  </CardTitle>
                  <CardDescription>{hub.address} • {hub.routes.length} routes</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedHubDetails(hub)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{hub.name} - Hub Details</DialogTitle>
                      <DialogDescription>
                        Manage routes for this hub
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <Label className="text-sm font-medium">Address</Label>
                          <p className="text-sm text-muted-foreground">{hub.address}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Transport Type</Label>
                          <Badge variant="outline" className="ml-2">{hub.transport_type}</Badge>
                        </div>
                      </div>
                      
                      {/* Quick Assign Route in Dialog */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Assign Route to This Hub</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Unassigned Route</Label>
                            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an unassigned route" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredUnassignedRoutes.map((route) => (
                                  <SelectItem key={route.id} value={route.id}>
                                    {route.name} ({route.start_point} → {route.end_point})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            onClick={() => {
                              setSelectedHub(hub.id);
                              handleAssignRoute();
                            }}
                            disabled={!selectedRoute}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Assign Route
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Routes List */}
                      <div>
                        <h3 className="font-semibold mb-3">Assigned Routes ({hub.routes.length})</h3>
                        {hub.routes.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No routes assigned to this hub</p>
                        ) : (
                          <div className="space-y-2">
                            {hub.routes.map((route) => (
                              <div key={route.id} className="flex items-center justify-between p-3 border rounded">
                                <div>
                                  <span className="font-medium">{route.name}</span>
                                  <p className="text-sm text-muted-foreground">
                                    {route.start_point} → {route.end_point}
                                  </p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveRoute(route.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Assigned Routes ({hub.routes.length})</h4>
                  </div>
                  {hub.routes.length === 0 ? (
                    <p className="text-muted-foreground">No routes assigned to this hub</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {hub.routes.slice(0, 3).map((route) => (
                        <Badge key={route.id} variant="outline">
                          {route.name}
                        </Badge>
                      ))}
                      {hub.routes.length > 3 && (
                        <Badge variant="secondary">+{hub.routes.length - 3} more</Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HubRoutesManagement;