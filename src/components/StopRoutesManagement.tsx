import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Search, Eye, Plus, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Route {
  id: string;
  name: string;
  start_point: string;
  end_point: string;
  transport_type: string;
}

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface StopRoute {
  id: string;
  route_id: string;
  stop_id: string;
  order_number: number;
  route_name: string;
  stop_name: string;
  transport_type: string;
}

const StopRoutesManagement = () => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [stopRoutes, setStopRoutes] = useState<StopRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  const [stopSearch, setStopSearch] = useState('');
  const [selectedStopDetails, setSelectedStopDetails] = useState<Stop | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [routesRes, stopsRes, stopRoutesRes] = await Promise.all([
        supabase.from('routes').select('*').order('name'),
        supabase.from('stops').select('*').order('name'),
        supabase.from('route_stops')
          .select(`
            id,
            route_id,
            stop_id,
            order_number,
            routes!inner(name, transport_type),
            stops!inner(name)
          `)
          .order('stop_id')
          .order('order_number')
      ]);

      if (routesRes.error) throw routesRes.error;
      if (stopsRes.error) throw stopsRes.error;
      if (stopRoutesRes.error) throw stopRoutesRes.error;

      setRoutes(routesRes.data || []);
      setStops(stopsRes.data || []);
      setStopRoutes(stopRoutesRes.data?.map(sr => ({
        id: sr.id,
        route_id: sr.route_id,
        stop_id: sr.stop_id,
        order_number: sr.order_number,
        route_name: (sr.routes as any).name,
        stop_name: (sr.stops as any).name,
        transport_type: (sr.routes as any).transport_type
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

  const handleAddRoute = async () => {
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
        description: "Route linked to stop successfully"
      });

      setSelectedRoute('');
      setSelectedStop('');
      setOrderNumber('');
      fetchData();
    } catch (error) {
      console.error('Error linking route to stop:', error);
      toast({
        title: "Error",
        description: "Failed to link route to stop",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStopRoute = async (id: string) => {
    try {
      const { error } = await supabase
        .from('route_stops')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Route removed from stop successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error removing route from stop:', error);
      toast({
        title: "Error",
        description: "Failed to remove route from stop",
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
        <h1 className="text-3xl font-bold">Stop Routes Management</h1>
        <p className="text-muted-foreground">Search stops and manage which routes are linked to them</p>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Add Route to Stop Form */}
      <Card>
        <CardHeader>
          <CardTitle>Link Route to Stop</CardTitle>
          <CardDescription>Select a stop and route to link, then specify the order position</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Button onClick={handleAddRoute}>Link Route to Stop</Button>
        </CardContent>
      </Card>

      {/* Stops List with Details View */}
      <div className="space-y-4">
        {filteredStops.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No stops found</p>
            </CardContent>
          </Card>
        ) : (
          filteredStops.map((stop) => {
            const routesForStop = stopRoutes
              .filter(sr => sr.stop_id === stop.id)
              .sort((a, b) => a.route_name.localeCompare(b.route_name));

            return (
              <Card key={stop.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle>{stop.name}</CardTitle>
                      <CardDescription>
                        {routesForStop.length} route{routesForStop.length !== 1 ? 's' : ''} linked
                      </CardDescription>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedStopDetails(stop)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {stop.name} - Stop Details
                        </DialogTitle>
                        <DialogDescription>
                          Manage routes linked to this stop
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">Latitude</Label>
                            <p className="text-sm text-muted-foreground">{stop.latitude}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Longitude</Label>
                            <p className="text-sm text-muted-foreground">{stop.longitude}</p>
                          </div>
                        </div>
                        
                        {/* Quick Add Route in Dialog */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Link Route to This Stop</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Route</Label>
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
                                  setSelectedStop(stop.id);
                                  handleAddRoute();
                                }}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Link Route
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Routes List */}
                        <div>
                          <h3 className="font-semibold mb-3">Linked Routes ({routesForStop.length})</h3>
                          {routesForStop.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No routes linked to this stop</p>
                          ) : (
                            <div className="space-y-2">
                              {routesForStop.map((stopRoute) => (
                                <div key={stopRoute.id} className="flex items-center justify-between p-3 border rounded">
                                  <div className="flex items-center space-x-3">
                                    <Badge variant="outline">{stopRoute.transport_type}</Badge>
                                    <span className="font-medium">{stopRoute.route_name}</span>
                                    <Badge variant="secondary">Stop #{stopRoute.order_number}</Badge>
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteStopRoute(stopRoute.id)}
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
                  {routesForStop.length === 0 ? (
                    <p className="text-muted-foreground">No routes linked to this stop</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {routesForStop.slice(0, 5).map((stopRoute) => (
                        <Badge key={stopRoute.id} variant="outline">
                          {stopRoute.route_name}
                        </Badge>
                      ))}
                      {routesForStop.length > 5 && (
                        <Badge variant="secondary">+{routesForStop.length - 5} more</Badge>
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

export default StopRoutesManagement;
