import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Navigation, Trash2, Route, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Journey {
  id: string;
  route_id: string;
  current_stop_sequence: number;
  last_ping_time: string;
  updated_at: string;
  status: string;
  created_at: string;
  routes?: {
    name: string;
    start_point: string;
    end_point: string;
  };
}

const JourneysManagement = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      const { data, error } = await supabase
        .from('journeys' as any)
        .select(`
          *,
          routes:route_id(name, start_point, end_point)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJourneys(data as any || []);
    } catch (error) {
      console.error('Error fetching journeys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch journeys.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journey?')) return;

    try {
      const { error } = await supabase
        .from('journeys' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setJourneys(journeys.filter(journey => journey.id !== id));
      toast({
        title: "Success",
        description: "Journey deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting journey:', error);
      toast({
        title: "Error",
        description: "Failed to delete journey.",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journeys Management</h1>
          <p className="text-muted-foreground">
            Manage active and completed transport journeys
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Active Journeys ({journeys.length})
          </CardTitle>
          <CardDescription>
            View and manage transport journeys in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {journeys.length === 0 ? (
            <div className="text-center py-8">
              <Navigation className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No journeys found</h3>
              <p className="text-muted-foreground">No active journeys in the system.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Journey ID</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Route Details</TableHead>
                    <TableHead>Current Stop</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Ping</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journeys.map((journey) => (
                    <TableRow key={journey.id}>
                      <TableCell className="font-mono text-sm">
                        {journey.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Route className="h-4 w-4" />
                          {journey.routes?.name || 'Unknown Route'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>From: {journey.routes?.start_point}</div>
                          <div>To: {journey.routes?.end_point}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          Stop #{journey.current_stop_sequence}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(journey.status)}`}>
                          {journey.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatDateTime(journey.last_ping_time)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(journey.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(journey.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JourneysManagement;