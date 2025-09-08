import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  route: { name: string };
  stop: { name: string };
}

const RouteStopsManagement = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedStop, setSelectedStop] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
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
        route: { name: rs.routes.name },
        stop: { name: rs.stops.name }
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

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const routeStop = routeStops.find(rs => rs.id === id);
    if (!routeStop) return;

    const sameRouteStops = routeStops
      .filter(rs => rs.route_id === routeStop.route_id)
      .sort((a, b) => a.order_number - b.order_number);

    const currentIndex = sameRouteStops.findIndex(rs => rs.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sameRouteStops.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapWith = sameRouteStops[newIndex];

    try {
      const { error } = await supabase
        .from('route_stops')
        .update({ order_number: swapWith.order_number })
        .eq('id', id);

      if (error) throw error;

      const { error: error2 } = await supabase
        .from('route_stops')
        .update({ order_number: routeStop.order_number })
        .eq('id', swapWith.id);

      if (error2) throw error2;

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <div className="h-32 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  const groupedRouteStops = routeStops.reduce((acc, routeStop) => {
    if (!acc[routeStop.route_id]) {
      acc[routeStop.route_id] = [];
    }
    acc[routeStop.route_id].push(routeStop);
    return acc;
  }, {} as Record<string, RouteStop[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Route Stops</h1>
        <p className="text-muted-foreground">Manage stops for each route</p>
      </div>

      {/* Add Stop to Route Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Stop to Route</CardTitle>
          <CardDescription>Link a stop to a route with order number</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="route">Route</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
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
                  <SelectValue placeholder="Select stop" />
                </SelectTrigger>
                <SelectContent>
                  {stops.map((stop) => (
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
                type="number"
                placeholder="Order"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                min="1"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddStop} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Stops List */}
      <div className="space-y-4">
        {Object.entries(groupedRouteStops).map(([routeId, stops]) => {
          const route = routes.find(r => r.id === routeId);
          const sortedStops = stops.sort((a, b) => a.order_number - b.order_number);
          
          return (
            <Card key={routeId}>
              <CardHeader>
                <CardTitle>{route?.name || 'Unknown Route'}</CardTitle>
                <CardDescription>
                  {route?.start_point} → {route?.end_point}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sortedStops.map((routeStop, index) => (
                    <div key={routeStop.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                          {routeStop.order_number}
                        </div>
                        <span className="font-medium">{routeStop.stop.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(routeStop.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(routeStop.id, 'down')}
                          disabled={index === sortedStops.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRouteStop(routeStop.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {sortedStops.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No stops assigned to this route
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {Object.keys(groupedRouteStops).length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">
                No route stops configured yet. Add stops to routes above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RouteStopsManagement;