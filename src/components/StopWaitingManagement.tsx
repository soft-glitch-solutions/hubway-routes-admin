import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Clock, Trash2, User, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StopWaiting {
  id: string;
  stop_id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
  route_id: string | null;
  transport_type: string | null;
  journey_id: string | null;
  stops?: {
    name: string;
  } | null;
  routes?: {
    name: string;
  } | null;
}

const StopWaitingManagement = () => {
  const [waitingEntries, setWaitingEntries] = useState<StopWaiting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWaitingEntries();
  }, []);

  const fetchWaitingEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('stop_waiting')
        .select(`
          *,
          stops:stop_id(name),
          routes:route_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWaitingEntries(data as any || []);
    } catch (error) {
      console.error('Error fetching waiting entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch waiting entries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this waiting entry?')) return;

    try {
      const { error } = await supabase
        .from('stop_waiting')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWaitingEntries(waitingEntries.filter(entry => entry.id !== id));
      toast({
        title: "Success",
        description: "Waiting entry deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting waiting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete waiting entry.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Are you sure you want to delete all ${waitingEntries.length} waiting entries? This action cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('stop_waiting')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      setWaitingEntries([]);
      toast({
        title: "Success",
        description: "All waiting entries deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting all waiting entries:', error);
      toast({
        title: "Error",
        description: "Failed to delete all waiting entries.",
        variant: "destructive",
      });
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
          <h1 className="text-3xl font-bold tracking-tight">Stop Waiting Management</h1>
          <p className="text-muted-foreground">
            Manage active and expired waiting entries at stops
          </p>
        </div>
        {waitingEntries.length > 0 && (
          <Button variant="destructive" onClick={handleDeleteAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Waiting Entries ({waitingEntries.length})
          </CardTitle>
          <CardDescription>
            View and manage users currently waiting or recently expired at stops
          </CardDescription>
        </CardHeader>
        <CardContent>
          {waitingEntries.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No waiting entries found</h3>
              <p className="text-muted-foreground">No users are currently waiting at any stops.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Stop</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Transport Type</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Expires At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {entry.user_id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {entry.stops?.name || 'Unknown Stop'}
                        </div>
                      </TableCell>
                      <TableCell>{entry.routes?.name || 'No Route'}</TableCell>
                      <TableCell>{entry.transport_type || 'Any'}</TableCell>
                      <TableCell>{formatDateTime(entry.created_at)}</TableCell>
                      <TableCell>{formatDateTime(entry.expires_at)}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isExpired(entry.expires_at) 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {isExpired(entry.expires_at) ? 'Expired' : 'Active'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
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

export default StopWaitingManagement;