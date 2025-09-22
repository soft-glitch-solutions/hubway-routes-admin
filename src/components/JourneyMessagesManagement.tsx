import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Trash2, User, Eye, EyeOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface JourneyMessage {
  id: string;
  journey_id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_anonymous: boolean;
  journeys?: {
    routes?: {
      name: string;
    };
  };
}

const JourneyMessagesManagement = () => {
  const [messages, setMessages] = useState<JourneyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('journey_messages' as any)
        .select(`
          *,
          journeys:journey_id(
            routes:route_id(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data as any || []);
    } catch (error) {
      console.error('Error fetching journey messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch journey messages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('journey_messages' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessages(messages.filter(message => message.id !== id));
      toast({
        title: "Success",
        description: "Message deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
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
          <h1 className="text-3xl font-bold tracking-tight">Journey Messages Management</h1>
          <p className="text-muted-foreground">
            Manage messages sent during transport journeys
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Journey Messages ({messages.length})
          </CardTitle>
          <CardDescription>
            View and moderate messages sent by users during their journeys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No messages found</h3>
              <p className="text-muted-foreground">No journey messages have been sent yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message ID</TableHead>
                    <TableHead>Journey/Route</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Anonymous</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-mono text-sm">
                        {message.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{message.journeys?.routes?.name || 'Unknown Route'}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              Journey: {message.journey_id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-mono text-sm">
                            {message.user_id.slice(0, 8)}...
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{truncateMessage(message.message)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {message.is_anonymous ? (
                            <>
                              <EyeOff className="h-4 w-4 text-amber-500" />
                              <span className="text-xs text-amber-600">Anonymous</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 text-green-500" />
                              <span className="text-xs text-green-600">Public</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(message.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(message.id)}
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

export default JourneyMessagesManagement;