
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RouteData {
  id?: string;
  name: string;
  start_point: string;
  end_point: string;
  transport_type: string;
  cost: number;
  hub_id: string | null;
  instructions: string | null;
}

interface Hub {
  id: string;
  name: string;
}

interface RouteFormProps {
  route?: RouteData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const RouteForm = ({ route, onSuccess, onCancel }: RouteFormProps) => {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_point: '',
    end_point: '',
    transport_type: '',
    cost: '',
    hub_id: '',
    instructions: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchHubs();
    if (route) {
      setFormData({
        name: route.name,
        start_point: route.start_point,
        end_point: route.end_point,
        transport_type: route.transport_type,
        cost: route.cost.toString(),
        hub_id: route.hub_id || '',
        instructions: route.instructions || '',
      });
    }
  }, [route]);

  const fetchHubs = async () => {
    try {
      const { data, error } = await supabase
        .from('hubs')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setHubs(data || []);
    } catch (error) {
      console.error('Error fetching hubs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const routeData = {
        name: formData.name,
        start_point: formData.start_point,
        end_point: formData.end_point,
        transport_type: formData.transport_type,
        cost: parseFloat(formData.cost),
        hub_id: formData.hub_id === 'none' ? null : formData.hub_id || null,
        instructions: formData.instructions || null,
      };

      let error;
      if (route?.id) {
        // Update existing route
        const { error: updateError } = await supabase
          .from('routes')
          .update(routeData)
          .eq('id', route.id);
        error = updateError;
      } else {
        // Create new route
        const { error: insertError } = await supabase
          .from('routes')
          .insert(routeData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Route ${route?.id ? 'updated' : 'created'} successfully.`,
      });
      onSuccess();
    } catch (error) {
      console.error('Error saving route:', error);
      toast({
        title: "Error",
        description: `Failed to ${route?.id ? 'update' : 'create'} route.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{route?.id ? 'Edit Route' : 'Create New Route'}</DialogTitle>
        <DialogDescription>
          {route?.id ? 'Update route information' : 'Add a new transport route to the system'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Route Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            className="transport-input"
            placeholder="e.g., City Center to Airport"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_point">Start Point</Label>
            <Input
              id="start_point"
              value={formData.start_point}
              onChange={(e) => setFormData({...formData, start_point: e.target.value})}
              required
              className="transport-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_point">End Point</Label>
            <Input
              id="end_point"
              value={formData.end_point}
              onChange={(e) => setFormData({...formData, end_point: e.target.value})}
              required
              className="transport-input"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="transport_type">Transport Type</Label>
          <Select value={formData.transport_type} onValueChange={(value) => setFormData({...formData, transport_type: value})}>
            <SelectTrigger className="transport-input">
              <SelectValue placeholder="Select transport type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bus">Bus</SelectItem>
              <SelectItem value="Taxi">Taxi</SelectItem>
              <SelectItem value="Train">Train</SelectItem>
              <SelectItem value="Metro">Metro</SelectItem>
              <SelectItem value="Shuttle">Shuttle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cost">Cost (R)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
              required
              className="transport-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hub_id">Associated Hub (Optional)</Label>
            <Select value={formData.hub_id} onValueChange={(value) => setFormData({...formData, hub_id: value})}>
              <SelectTrigger className="transport-input">
                <SelectValue placeholder="Select hub" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No hub</SelectItem>
                {hubs.map((hub) => (
                  <SelectItem key={hub.id} value={hub.id}>
                    {hub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="instructions">Special Instructions (Optional)</Label>
          <Textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
            placeholder="e.g., Student card required, Workers only, Special requirements..."
            className="transport-input min-h-[80px]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit" 
            className="transport-button-primary flex-1"
            disabled={loading}
          >
            {loading ? 'Saving...' : route?.id ? 'Update Route' : 'Create Route'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="transport-button-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default RouteForm;
