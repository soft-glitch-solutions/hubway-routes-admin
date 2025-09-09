import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Trash2, Search, Eye, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Route {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
}

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface RouteStop {
  id: string;
  route_id: string;
  stop_id: string;
  order_number: number;
  route_name: string;
  stop_name: string;
}

const RouteStopsManagement = () => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  const [stopSearch, setStopSearch] = useState('');
  const [selectedRouteDetails, setSelectedRouteDetails] = useState<Route | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [routesRes, stopsRes, routeStopsRes] = await Promise.all([
        supabase.from('routes').select('*').order('name'),
        supabase.from('stops').select('*').order('name'),
        supabase.from('route_stops')
          .select(`
            id,
            route_id,
            stop_id,
            order_number,
            routes!inner(name),
            stops!inner(name)
          `)
          .order('route_id')
          .order('order_number')
      ]);

      if (routesRes.error) throw routesRes.error;
      if (stopsRes.error) throw stopsRes.error;
      if (routeStopsRes.error) throw routeStopsRes.error;

      setRoutes(routesRes.data || []);
      setStops(stopsRes.data || []);
      setRouteStops(routeStopsRes.data?.map(rs => ({
        id: rs.id,
        route_id: rs.route_id,
        stop_id: rs.stop_id,
        order_number: rs.order_number,
        route_name: rs.routes.name,
        stop_name: rs.stops.name
      })) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = async () => {
    if (!selectedRoute || !selectedStop || !orderNumber) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('route_stops')
        .insert({
          route_id: selectedRoute,
          stop_id: selectedStop,
          order_number: parseInt(orderNumber)
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stop added to route successfully"
      });

      setSelectedRoute('');
      setSelectedStop('');
      setOrderNumber('');
      fetchData();
    } catch (error) {
      console.error('Error adding stop to route:', error);
      toast({
        title: "Error",
        description: "Failed to add stop to route",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRouteStop = async (id: string) => {
    try {
      const { error } = await supabase
        .from('route_stops')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stop removed from route successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error removing stop from route:', error);
      toast({
        title: "Error",
        description: "Failed to remove stop from route",
        variant: "destructive"
      });
    }
  };

  const handleReorder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('route_stops')
        .update({ order_number: newOrder })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error reordering stops:', error);
      toast({
        title: "Error",
        description: "Failed to reorder stops",
        variant: "destructive"
      });
    }
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(routeSearch.toLowerCase())
  );

  const filteredStops = stops.filter(stop =>
    stop.name.toLowerCase().includes(stopSearch.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Route Stops Management</h1>
        <p className="text-muted-foreground">Manage stops for each route and their order</p>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <Label htmlFor="stop-search">Search Stops</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="stop-search"
                placeholder="Search stops..."
                value={stopSearch}
                onChange={(e) => setStopSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Stop to Route Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Stop to Route</CardTitle>
          <CardDescription>Select a route and stop to add, then specify the order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="route">Route</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRoutes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stop">Stop</Label>
              <Select value={selectedStop} onValueChange={setSelectedStop}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a stop" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStops.map((stop) => (
                    <SelectItem key={stop.id} value={stop.id}>
                      {stop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="order">Order Number</Label>
              <Input
                id="order"
                type="number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
          </div>
          <Button onClick={handleAddStop}>Add Stop to Route</Button>
        </CardContent>
      </Card>

      {/* Routes List with Details View */}
      <div className="space-y-4">
        {filteredRoutes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No routes found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRoutes.map((route) => {
            const routeStopsForRoute = routeStops
              .filter(rs => rs.route_id === route.id)
              .sort((a, b) => a.order_number - b.order_number);

            return (
              <Card key={route.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{route.name}</CardTitle>
                    <CardDescription>
                      {route.start_point} to {route.end_point} • {routeStopsForRoute.length} stops
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedRouteDetails(route)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{route.name} - Route Details</DialogTitle>
                        <DialogDescription>
                          Manage stops for this route
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">Start Point</Label>
                            <p className="text-sm text-muted-foreground">{route.start_point}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">End Point</Label>
                            <p className="text-sm text-muted-foreground">{route.end_point}</p>
                          </div>
                        </div>
                        
                        {/* Quick Add Stop in Dialog */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Add Stop to This Route</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Stop</Label>
                              <Select value={selectedStop} onValueChange={setSelectedStop}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a stop" />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredStops.map((stop) => (
                                    <SelectItem key={stop.id} value={stop.id}>
                                      {stop.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Order Number</Label>
                              <Input
                                type="number"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="1"
                                min="1"
                              />
                            </div>
                            <div className="col-span-2">
                              <Button 
                                onClick={() => {
                                  setSelectedRoute(route.id);
                                  handleAddStop();
                                }}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Stop
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Stops List */}
                        <div>
                          <h3 className="font-semibold mb-3">Route Stops ({routeStopsForRoute.length})</h3>
                          {routeStopsForRoute.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No stops assigned to this route</p>
                          ) : (
                            <div className="space-y-2">
                              {routeStopsForRoute.map((routeStop, index) => (
                                <div key={routeStop.id} className="flex items-center justify-between p-3 border rounded">
                                  <div className="flex items-center space-x-3">
                                    <Badge variant="secondary">#{routeStop.order_number}</Badge>
                                    <span className="font-medium">{routeStop.stop_name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleReorder(routeStop.id, routeStop.order_number - 1)}
                                      disabled={index === 0}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleReorder(routeStop.id, routeStop.order_number + 1)}
                                      disabled={index === routeStopsForRoute.length - 1}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteRouteStop(routeStop.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
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
                  {routeStopsForRoute.length === 0 ? (
                    <p className="text-muted-foreground">No stops assigned to this route</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {routeStopsForRoute.slice(0, 5).map((routeStop) => (
                        <Badge key={routeStop.id} variant="outline">
                          #{routeStop.order_number} {routeStop.stop_name}
                        </Badge>
                      ))}
                      {routeStopsForRoute.length > 5 && (
                        <Badge variant="secondary">+{routeStopsForRoute.length - 5} more</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RouteStopsManagement;