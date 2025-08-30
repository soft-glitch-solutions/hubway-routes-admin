import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Map, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface NearbySpot {
  id: string;
  stop_id: string;
  name: string;
  description: string | null;
  category: string | null;
  latitude: number;
  longitude: number;
  distance_meters: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Stop {
  id: string;
  name: string;
}

const NearbySpotsManagement = () => {
  const [nearbySpots, setNearbySpots] = useState<NearbySpot[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<NearbySpot | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    stop_id: '',
    name: '',
    description: '',
    category: '',
    latitude: '',
    longitude: '',
    distance_meters: '',
    image_url: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNearbySpots();
    fetchStops();
  }, []);

  const fetchNearbySpots = async () => {
    try {
      const { data, error } = await supabase
        .from('nearby_spots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNearbySpots(data || []);
    } catch (error) {
      console.error('Error fetching nearby spots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch nearby spots.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStops = async () => {
    try {
      const { data, error } = await supabase
        .from('stops')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setStops(data || []);
    } catch (error) {
      console.error('Error fetching stops:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('nearby_spots')
        .insert({
          stop_id: formData.stop_id,
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          distance_meters: formData.distance_meters ? parseInt(formData.distance_meters) : null,
          image_url: formData.image_url || null,
        })
        .select()
        .single();

      if (error) throw error;

      setNearbySpots([data, ...nearbySpots]);
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Nearby spot created successfully.",
      });
    } catch (error) {
      console.error('Error creating nearby spot:', error);
      toast({
        title: "Error",
        description: "Failed to create nearby spot.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpot) return;

    try {
      const { data, error } = await supabase
        .from('nearby_spots')
        .update({
          stop_id: formData.stop_id,
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          distance_meters: formData.distance_meters ? parseInt(formData.distance_meters) : null,
          image_url: formData.image_url || null,
        })
        .eq('id', selectedSpot.id)
        .select()
        .single();

      if (error) throw error;

      setNearbySpots(nearbySpots.map(spot => spot.id === selectedSpot.id ? data : spot));
      setIsEditOpen(false);
      setSelectedSpot(null);
      resetForm();
      toast({
        title: "Success",
        description: "Nearby spot updated successfully.",
      });
    } catch (error) {
      console.error('Error updating nearby spot:', error);
      toast({
        title: "Error",
        description: "Failed to update nearby spot.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (spotId: string) => {
    if (!confirm('Are you sure you want to delete this nearby spot?')) return;

    try {
      const { error } = await supabase
        .from('nearby_spots')
        .delete()
        .eq('id', spotId);

      if (error) throw error;

      setNearbySpots(nearbySpots.filter(spot => spot.id !== spotId));
      toast({
        title: "Success",
        description: "Nearby spot deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting nearby spot:', error);
      toast({
        title: "Error",
        description: "Failed to delete nearby spot.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (spot: NearbySpot) => {
    setSelectedSpot(spot);
    setFormData({
      stop_id: spot.stop_id,
      name: spot.name,
      description: spot.description || '',
      category: spot.category || '',
      latitude: spot.latitude.toString(),
      longitude: spot.longitude.toString(),
      distance_meters: spot.distance_meters?.toString() || '',
      image_url: spot.image_url || '',
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      stop_id: '',
      name: '',
      description: '',
      category: '',
      latitude: '',
      longitude: '',
      distance_meters: '',
      image_url: '',
    });
  };

  const filteredSpots = nearbySpots.filter(spot =>
    spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Map className="w-8 h-8 text-primary" />
            Nearby Spots Management
          </h1>
          <p className="text-muted-foreground">Manage points of interest near transport stops</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="transport-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Nearby Spot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Nearby Spot</DialogTitle>
              <DialogDescription>
                Add a new point of interest near a transport stop
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stop_id">Associated Stop</Label>
                <Select value={formData.stop_id} onValueChange={(value) => setFormData({...formData, stop_id: value})} required>
                  <SelectTrigger className="transport-input">
                    <SelectValue placeholder="Select a stop" />
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
              <div className="space-y-2">
                <Label htmlFor="name">Spot Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="transport-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="transport-input">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Restaurant">Restaurant</SelectItem>
                    <SelectItem value="Shop">Shop</SelectItem>
                    <SelectItem value="Hospital">Hospital</SelectItem>
                    <SelectItem value="School">School</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="Gas Station">Gas Station</SelectItem>
                    <SelectItem value="Park">Park</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="transport-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    required
                    className="transport-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    required
                    className="transport-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance_meters">Distance (meters)</Label>
                <Input
                  id="distance_meters"
                  type="number"
                  value={formData.distance_meters}
                  onChange={(e) => setFormData({...formData, distance_meters: e.target.value})}
                  className="transport-input"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="transport-button-primary flex-1">
                  Create Spot
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  className="transport-button-secondary flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nearby spots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transport-input"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSpots.length === 0 ? (
          <Card className="transport-card">
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {searchTerm ? 'No nearby spots found matching your search.' : 'No nearby spots available. Create your first spot!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSpots.map((spot) => (
            <Card key={spot.id} className="transport-card hover:shadow-xl transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-foreground">{spot.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {spot.description || 'No description'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {spot.category && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30">
                        {spot.category}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(spot)}
                      className="transport-button-secondary"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(spot.id)}
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Coordinates</p>
                    <p className="font-medium">{spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Distance</p>
                    <p className="font-medium">{spot.distance_meters ? `${spot.distance_meters}m` : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stop</p>
                    <p className="font-medium">{stops.find(s => s.id === spot.stop_id)?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(spot.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Nearby Spot</DialogTitle>
            <DialogDescription>
              Update nearby spot information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stop_id">Associated Stop</Label>
              <Select value={formData.stop_id} onValueChange={(value) => setFormData({...formData, stop_id: value})} required>
                <SelectTrigger className="transport-input">
                  <SelectValue placeholder="Select a stop" />
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
            <div className="space-y-2">
              <Label htmlFor="edit-name">Spot Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="transport-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="transport-input">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Restaurant">Restaurant</SelectItem>
                  <SelectItem value="Shop">Shop</SelectItem>
                  <SelectItem value="Hospital">Hospital</SelectItem>
                  <SelectItem value="School">School</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="Gas Station">Gas Station</SelectItem>
                  <SelectItem value="Park">Park</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="transport-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                  required
                  className="transport-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                  required
                  className="transport-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-distance_meters">Distance (meters)</Label>
              <Input
                id="edit-distance_meters"
                type="number"
                value={formData.distance_meters}
                onChange={(e) => setFormData({...formData, distance_meters: e.target.value})}
                className="transport-input"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="transport-button-primary flex-1">
                Update Spot
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                className="transport-button-secondary flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NearbySpotsManagement;
