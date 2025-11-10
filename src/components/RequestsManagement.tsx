import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, DollarSign, Building2, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';

interface PriceChangeRequest {
  id: string;
  user_id: string;
  route_id: string;
  current_price: number;
  new_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface HubRequest {
  id: string;
  user_id: string;
  name: string;
  address: string;
  transport_type: string;
  description: string | null;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StopRequest {
  id: string;
  user_id: string;
  route_id: string;
  name: string;
  latitude: number;
  longitude: number;
  cost: number | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const RequestsManagement = () => {
  const [priceRequests, setPriceRequests] = useState<PriceChangeRequest[]>([]);
  const [hubRequests, setHubRequests] = useState<HubRequest[]>([]);
  const [stopRequests, setStopRequests] = useState<StopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      const [priceData, hubData, stopData] = await Promise.all([
        supabase.from('price_change_requests').select('*, profiles(first_name, last_name, avatar_url)').order('created_at', { ascending: false }),
        supabase.from('hub_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('stop_requests').select('*').order('created_at', { ascending: false }),
      ]);

      if (priceData.error) throw priceData.error;
      if (hubData.error) throw hubData.error;
      if (stopData.error) throw stopData.error;

      setPriceRequests(priceData.data || []);
      setHubRequests(hubData.data || []);
      setStopRequests(stopData.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePriceRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const request = priceRequests.find(req => req.id === requestId);
      if (!request) return;

      // If approved, update the route price
      if (newStatus === 'approved') {
        const { error: routeError } = await supabase
          .from('routes')
          .update({ cost: request.new_price })
          .eq('id', request.route_id);

        if (routeError) throw routeError;

        // Award points for approved request
        const pointsToAward = 50;
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', request.user_id)
          .single();

        const currentPoints = profileData?.points || 0;
        
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ 
            points: currentPoints + pointsToAward
          })
          .eq('id', request.user_id);

        if (pointsError) {
          console.error('Error awarding points:', pointsError);
        }
      }

      // Delete the request after processing
      const { error: deleteError } = await supabase
        .from('price_change_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      // Remove from state
      setPriceRequests(priceRequests.filter(req => req.id !== requestId));

      toast({
        title: "Success",
        description: newStatus === 'approved' 
          ? `Price change approved and route updated! User awarded 50 points.`
          : `Price change request ${newStatus} and removed.`,
      });
    } catch (error) {
      console.error('Error updating price request:', error);
      toast({
        title: "Error",
        description: "Failed to process request.",
        variant: "destructive",
      });
    }
  };

  const updateHubRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const request = hubRequests.find(req => req.id === requestId);
      if (!request) return;

      // If approved, create the hub
      if (newStatus === 'approved') {
        const { error: hubError } = await supabase
          .from('hubs')
          .insert({
            name: request.name,
            address: request.address,
            transport_type: request.transport_type,
            latitude: request.latitude,
            longitude: request.longitude,
          });

        if (hubError) throw hubError;
      }

      // Delete the request after processing
      const { error: deleteError } = await supabase
        .from('hub_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      // Remove from state
      setHubRequests(hubRequests.filter(req => req.id !== requestId));

      toast({
        title: "Success",
        description: newStatus === 'approved' 
          ? `Hub request approved and hub created!`
          : `Hub request ${newStatus} and removed.`,
      });
    } catch (error) {
      console.error('Error updating hub request:', error);
      toast({
        title: "Error",
        description: "Failed to process request.",
        variant: "destructive",
      });
    }
  };

  const updateStopRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const request = stopRequests.find(req => req.id === requestId);
      if (!request) return;

      // If approved, create the stop
      if (newStatus === 'approved') {
        const { error: stopError } = await supabase
          .from('stops')
          .insert({
            name: request.name,
            latitude: request.latitude,
            longitude: request.longitude,
            cost: request.cost,
            route_id: request.route_id,
          });

        if (stopError) throw stopError;
      }

      // Delete the request after processing
      const { error: deleteError } = await supabase
        .from('stop_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      // Remove from state
      setStopRequests(stopRequests.filter(req => req.id !== requestId));

      toast({
        title: "Success",
        description: newStatus === 'approved' 
          ? `Stop request approved and stop created!`
          : `Stop request ${newStatus} and removed.`,
      });
    } catch (error) {
      console.error('Error updating stop request:', error);
      toast({
        title: "Error",
        description: "Failed to process request.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, className: "bg-warning/20 text-warning border-warning/30" },
      approved: { icon: CheckCircle, className: "bg-success/20 text-success border-success/30" },
      rejected: { icon: XCircle, className: "bg-destructive/20 text-destructive border-destructive/30" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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
            <FileText className="w-8 h-8 text-primary" />
            Requests Management
          </h1>
          <p className="text-muted-foreground">Manage price changes, hub requests, and stop requests</p>
        </div>
      </div>

      <Tabs defaultValue="price" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="price" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Price Changes ({priceRequests.length})
          </TabsTrigger>
          <TabsTrigger value="hub" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Hub Requests ({hubRequests.length})
          </TabsTrigger>
          <TabsTrigger value="stop" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Stop Requests ({stopRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Price Change Requests */}
        <TabsContent value="price" className="space-y-4">
          {priceRequests.length === 0 ? (
            <Card className="transport-card">
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No price change requests available.</p>
              </CardContent>
            </Card>
          ) : (
            priceRequests.map((request) => (
              <Card key={request.id} className="transport-card hover:shadow-xl transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {request.profiles?.avatar_url ? (
                          <img 
                            src={request.profiles.avatar_url} 
                            alt="User avatar" 
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                            {request.profiles?.first_name?.[0] || 'U'}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-xl text-foreground">
                            {request.profiles?.first_name && request.profiles?.last_name
                              ? `${request.profiles.first_name} ${request.profiles.last_name}`
                              : 'Unknown User'}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Route ID: {request.route_id}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Current Price</p>
                      <p className="font-medium text-lg">R {request.current_price}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Requested Price</p>
                      <p className="font-medium text-lg text-primary">R {request.new_price}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Change</p>
                      <p className={`font-medium text-lg ${request.new_price > request.current_price ? 'text-destructive' : 'text-success'}`}>
                        {request.new_price > request.current_price ? '+' : ''}
                        R {(request.new_price - request.current_price).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updatePriceRequestStatus(request.id, 'approved')}
                        className="transport-button-primary flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => updatePriceRequestStatus(request.id, 'rejected')}
                        variant="outline"
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Hub Requests */}
        <TabsContent value="hub" className="space-y-4">
          {hubRequests.length === 0 ? (
            <Card className="transport-card">
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No hub requests available.</p>
              </CardContent>
            </Card>
          ) : (
            hubRequests.map((request) => (
              <Card key={request.id} className="transport-card hover:shadow-xl transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-foreground">{request.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {request.address}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Transport Type</p>
                      <p className="font-medium">{request.transport_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Coordinates</p>
                      <p className="font-medium">{request.latitude.toFixed(4)}, {request.longitude.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Description</p>
                      <p className="font-medium">{request.description || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateHubRequestStatus(request.id, 'approved')}
                        className="transport-button-primary flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => updateHubRequestStatus(request.id, 'rejected')}
                        variant="outline"
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Stop Requests */}
        <TabsContent value="stop" className="space-y-4">
          {stopRequests.length === 0 ? (
            <Card className="transport-card">
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No stop requests available.</p>
              </CardContent>
            </Card>
          ) : (
            stopRequests.map((request) => (
              <Card key={request.id} className="transport-card hover:shadow-xl transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-foreground">{request.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Route ID: {request.route_id}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Coordinates</p>
                      <p className="font-medium">{request.latitude.toFixed(4)}, {request.longitude.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-medium">{request.cost ? `R ${request.cost}` : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Description</p>
                      <p className="font-medium">{request.description || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateStopRequestStatus(request.id, 'approved')}
                        className="transport-button-primary flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => updateStopRequestStatus(request.id, 'rejected')}
                        variant="outline"
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestsManagement;