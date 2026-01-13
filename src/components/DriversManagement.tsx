import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle, XCircle, Eye, Car, GraduationCap, Users, RefreshCw, FileImage } from 'lucide-react';
import DocumentViewer from './DocumentViewer';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface Driver {
  id: string;
  user_id: string;
  license_number: string;
  vehicle_type: string;
  vehicle_registration: string;
  is_verified: boolean | null;
  is_active: boolean | null;
  rating: number | null;
  total_trips: number | null;
  created_at: string | null;
  license_front_url: string | null;
  license_back_url: string | null;
  pdp_certificate_url: string | null;
  vehicle_photos: string[] | null;
  verification_notes: string | null;
  verified_at: string | null;
  profiles?: Profile;
}

interface SchoolTransport {
  id: string;
  driver_id: string;
  school_name: string;
  school_area: string;
  pickup_areas: string[];
  capacity: number;
  current_riders: number | null;
  price_per_month: number | null;
  vehicle_type: string;
  is_active: boolean | null;
  is_verified: boolean | null;
  verified_at: string | null;
  created_at: string | null;
  drivers?: Driver & { profiles?: Profile };
}

interface CarpoolClub {
  id: string;
  name: string;
  creator_id: string;
  from_location: string;
  to_location: string;
  pickup_time: string;
  max_members: number;
  current_members: number;
  is_active: boolean | null;
  created_at: string | null;
  profiles?: Profile;
}

const DriversManagement = () => {
  const [activeTab, setActiveTab] = useState('drivers');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [schoolTransports, setSchoolTransports] = useState<SchoolTransport[]>([]);
  const [carpoolClubs, setCarpoolClubs] = useState<CarpoolClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedSchoolTransport, setSelectedSchoolTransport] = useState<SchoolTransport | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  const [showSchoolDialog, setShowSchoolDialog] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [documentViewerDocs, setDocumentViewerDocs] = useState<{ url: string; title: string }[]>([]);
  const [documentViewerIndex, setDocumentViewerIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchDrivers(), fetchSchoolTransports(), fetchCarpoolClubs()]);
    setLoading(false);
  };

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        profiles!drivers_user_id_fkey (id, first_name, last_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching drivers', description: error.message, variant: 'destructive' });
    } else {
      setDrivers((data as unknown as Driver[]) || []);
    }
  };

  const fetchSchoolTransports = async () => {
    const { data, error } = await supabase
      .from('school_transports')
      .select(`
        *,
        drivers!school_transports_driver_id_fkey (
          *,
          profiles!drivers_user_id_fkey (id, first_name, last_name, avatar_url)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching school transports', description: error.message, variant: 'destructive' });
    } else {
      setSchoolTransports((data as unknown as SchoolTransport[]) || []);
    }
  };

  const fetchCarpoolClubs = async () => {
    const { data, error } = await supabase
      .from('carpool_clubs')
      .select(`
        *,
        profiles:creator_id (id, first_name, last_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching carpool clubs', description: error.message, variant: 'destructive' });
    } else {
      setCarpoolClubs(data || []);
    }
  };

  const handleVerifyDriver = async (driver: Driver, approve: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('drivers')
      .update({
        is_verified: approve,
        verification_notes: verificationNotes || null,
        verified_by: user?.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', driver.id);

    if (error) {
      toast({ title: 'Error updating driver', description: error.message, variant: 'destructive' });
      return;
    }

    // Update user role in user_roles table
    if (approve) {
      // Add driver role when verified
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: driver.user_id, 
          role: 'driver' 
        }, { 
          onConflict: 'user_id,role' 
        });
      
      if (roleError) {
        console.error('Error adding driver role:', roleError);
        toast({ title: 'Warning', description: 'Driver verified but role update failed.', variant: 'destructive' });
      }
    } else {
      // Remove driver role when rejected
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', driver.user_id)
        .eq('role', 'driver');
      
      if (roleError) {
        console.error('Error removing driver role:', roleError);
      }
    }

    toast({ title: approve ? 'Driver Verified' : 'Driver Rejected', description: `Driver has been ${approve ? 'verified' : 'rejected'} successfully.` });
    setShowDriverDialog(false);
    setSelectedDriver(null);
    setVerificationNotes('');
    fetchDrivers();
  };

  const handleVerifySchoolTransport = async (transport: SchoolTransport, approve: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('school_transports')
      .update({
        is_verified: approve,
        verified_by: user?.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', transport.id);

    if (error) {
      toast({ title: 'Error updating school transport', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: approve ? 'Service Verified' : 'Service Rejected', description: `School transport has been ${approve ? 'verified' : 'rejected'} successfully.` });
      setShowSchoolDialog(false);
      setSelectedSchoolTransport(null);
      fetchSchoolTransports();
    }
  };

  const handleToggleActive = async (type: 'driver' | 'school' | 'carpool', id: string, currentState: boolean | null) => {
    const table = type === 'driver' ? 'drivers' : type === 'school' ? 'school_transports' : 'carpool_clubs';
    
    const { error } = await supabase
      .from(table)
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status Updated', description: `Service has been ${!currentState ? 'activated' : 'deactivated'}.` });
      if (type === 'driver') fetchDrivers();
      else if (type === 'school') fetchSchoolTransports();
      else fetchCarpoolClubs();
    }
  };

  const getDriverName = (driver: Driver) => {
    const profile = driver.profiles;
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return 'Unknown Driver';
  };

  const filteredDrivers = drivers.filter(d => 
    getDriverName(d).toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.vehicle_registration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSchoolTransports = schoolTransports.filter(s => 
    s.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.school_area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCarpoolClubs = carpoolClubs.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.from_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.to_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingDrivers = drivers.filter(d => !d.is_verified).length;
  const pendingSchool = schoolTransports.filter(s => !s.is_verified).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Drivers Management</h2>
          <p className="text-muted-foreground">Manage and verify drivers and their services</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="w-4 h-4" />
              Total Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">{pendingDrivers} pending verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              School Transports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolTransports.length}</div>
            <p className="text-xs text-muted-foreground">{pendingSchool} pending verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Carpool Clubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carpoolClubs.length}</div>
            <p className="text-xs text-muted-foreground">{carpoolClubs.filter(c => c.is_active).length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verified Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.filter(d => d.is_verified).length}</div>
            <p className="text-xs text-muted-foreground">of {drivers.length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search drivers, schools, or carpools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            Drivers {pendingDrivers > 0 && <Badge variant="destructive" className="ml-1">{pendingDrivers}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="school" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            School Transport {pendingSchool > 0 && <Badge variant="destructive" className="ml-1">{pendingSchool}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="carpool" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Carpool
          </TabsTrigger>
        </TabsList>

        {/* Drivers Tab */}
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Driver Registrations</CardTitle>
              <CardDescription>View and verify driver registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="font-medium">{getDriverName(driver)}</div>
                        <div className="text-sm text-muted-foreground">
                          {driver.created_at ? new Date(driver.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{driver.license_number}</TableCell>
                      <TableCell>
                        <div>{driver.vehicle_type}</div>
                        <div className="text-sm text-muted-foreground">{driver.vehicle_registration}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{driver.rating?.toFixed(1) || '5.0'} ★</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={driver.is_verified ? 'default' : 'destructive'}>
                            {driver.is_verified ? 'Verified' : 'Pending'}
                          </Badge>
                          <Badge variant={driver.is_active ? 'outline' : 'secondary'}>
                            {driver.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDriver(driver);
                              setVerificationNotes(driver.verification_notes || '');
                              setShowDriverDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive('driver', driver.id, driver.is_active)}
                          >
                            {driver.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredDrivers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No drivers found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* School Transport Tab */}
        <TabsContent value="school">
          <Card>
            <CardHeader>
              <CardTitle>School Transport Services</CardTitle>
              <CardDescription>Manage school transport registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchoolTransports.map((transport) => (
                    <TableRow key={transport.id}>
                      <TableCell>
                        <div className="font-medium">{transport.school_name}</div>
                        <div className="text-sm text-muted-foreground">{transport.school_area}</div>
                      </TableCell>
                      <TableCell>
                        {transport.drivers?.profiles ? 
                          `${transport.drivers.profiles.first_name || ''} ${transport.drivers.profiles.last_name || ''}`.trim() || 'Unknown' 
                          : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div>{transport.current_riders || 0}/{transport.capacity}</div>
                        <div className="text-sm text-muted-foreground">{transport.vehicle_type}</div>
                      </TableCell>
                      <TableCell>
                        <div>R{transport.price_per_month}/mo</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={transport.is_verified ? 'default' : 'destructive'}>
                            {transport.is_verified ? 'Verified' : 'Pending'}
                          </Badge>
                          <Badge variant={transport.is_active ? 'outline' : 'secondary'}>
                            {transport.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSchoolTransport(transport);
                              setShowSchoolDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive('school', transport.id, transport.is_active)}
                          >
                            {transport.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredSchoolTransports.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No school transports found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carpool Tab */}
        <TabsContent value="carpool">
          <Card>
            <CardHeader>
              <CardTitle>Carpool Clubs</CardTitle>
              <CardDescription>Manage carpool club listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCarpoolClubs.map((club) => (
                    <TableRow key={club.id}>
                      <TableCell>
                        <div className="font-medium">{club.name}</div>
                        <div className="text-sm text-muted-foreground">{club.pickup_time}</div>
                      </TableCell>
                      <TableCell>
                        {club.profiles ? 
                          `${club.profiles.first_name || ''} ${club.profiles.last_name || ''}`.trim() || 'Unknown' 
                          : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {club.from_location} → {club.to_location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{club.current_members}/{club.max_members}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={club.is_active ? 'default' : 'secondary'}>
                          {club.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive('carpool', club.id, club.is_active)}
                        >
                          {club.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredCarpoolClubs.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No carpool clubs found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Driver Verification Dialog */}
      <Dialog open={showDriverDialog} onOpenChange={setShowDriverDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
            <DialogDescription>Review driver information and documents</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Driver Name</label>
                  <p className="text-muted-foreground">{getDriverName(selectedDriver)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">License Number</label>
                  <p className="text-muted-foreground">{selectedDriver.license_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Vehicle Type</label>
                  <p className="text-muted-foreground">{selectedDriver.vehicle_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Registration</label>
                  <p className="text-muted-foreground">{selectedDriver.vehicle_registration}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <p className="text-muted-foreground">{selectedDriver.rating?.toFixed(1) || '5.0'} ★</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Trips</label>
                  <p className="text-muted-foreground">{selectedDriver.total_trips || 0}</p>
                </div>
              </div>

              {/* Document Links */}
              <div>
                <label className="text-sm font-medium">Documents</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedDriver.license_front_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const docs = [];
                        if (selectedDriver.license_front_url) docs.push({ url: selectedDriver.license_front_url, title: 'License (Front)' });
                        if (selectedDriver.license_back_url) docs.push({ url: selectedDriver.license_back_url, title: 'License (Back)' });
                        if (selectedDriver.pdp_certificate_url) docs.push({ url: selectedDriver.pdp_certificate_url, title: 'PDP Certificate' });
                        setDocumentViewerDocs(docs);
                        setDocumentViewerIndex(0);
                        setShowDocumentViewer(true);
                      }}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      License (Front)
                    </Button>
                  )}
                  {selectedDriver.license_back_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const docs = [];
                        if (selectedDriver.license_front_url) docs.push({ url: selectedDriver.license_front_url, title: 'License (Front)' });
                        if (selectedDriver.license_back_url) docs.push({ url: selectedDriver.license_back_url, title: 'License (Back)' });
                        if (selectedDriver.pdp_certificate_url) docs.push({ url: selectedDriver.pdp_certificate_url, title: 'PDP Certificate' });
                        const backIndex = docs.findIndex(d => d.title === 'License (Back)');
                        setDocumentViewerDocs(docs);
                        setDocumentViewerIndex(backIndex >= 0 ? backIndex : 0);
                        setShowDocumentViewer(true);
                      }}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      License (Back)
                    </Button>
                  )}
                  {selectedDriver.pdp_certificate_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const docs = [];
                        if (selectedDriver.license_front_url) docs.push({ url: selectedDriver.license_front_url, title: 'License (Front)' });
                        if (selectedDriver.license_back_url) docs.push({ url: selectedDriver.license_back_url, title: 'License (Back)' });
                        if (selectedDriver.pdp_certificate_url) docs.push({ url: selectedDriver.pdp_certificate_url, title: 'PDP Certificate' });
                        const pdpIndex = docs.findIndex(d => d.title === 'PDP Certificate');
                        setDocumentViewerDocs(docs);
                        setDocumentViewerIndex(pdpIndex >= 0 ? pdpIndex : 0);
                        setShowDocumentViewer(true);
                      }}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      PDP Certificate
                    </Button>
                  )}
                </div>
              </div>

              {/* Vehicle Photos */}
              {selectedDriver.vehicle_photos && selectedDriver.vehicle_photos.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Vehicle Photos</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {selectedDriver.vehicle_photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const vehicleDocs = selectedDriver.vehicle_photos!.map((p, i) => ({
                            url: p,
                            title: `Vehicle Photo ${i + 1}`
                          }));
                          setDocumentViewerDocs(vehicleDocs);
                          setDocumentViewerIndex(index);
                          setShowDocumentViewer(true);
                        }}
                        className="relative group cursor-pointer"
                      >
                        <img src={photo} alt={`Vehicle ${index + 1}`} className="w-full h-24 object-cover rounded" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Notes */}
              <div>
                <label className="text-sm font-medium">Verification Notes</label>
                <Textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add any notes about this verification..."
                  className="mt-1"
                />
              </div>

              {selectedDriver.verified_at && (
                <div>
                  <label className="text-sm font-medium">Verified At</label>
                  <p className="text-muted-foreground">
                    {new Date(selectedDriver.verified_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDriverDialog(false)}>
              Close
            </Button>
            {selectedDriver && !selectedDriver.is_verified && (
              <>
                <Button variant="destructive" onClick={() => handleVerifyDriver(selectedDriver, false)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => handleVerifyDriver(selectedDriver, true)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* School Transport Dialog */}
      <Dialog open={showSchoolDialog} onOpenChange={setShowSchoolDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>School Transport Details</DialogTitle>
            <DialogDescription>Review school transport service information</DialogDescription>
          </DialogHeader>
          {selectedSchoolTransport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">School</label>
                  <p className="text-muted-foreground">{selectedSchoolTransport.school_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Area</label>
                  <p className="text-muted-foreground">{selectedSchoolTransport.school_area}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Driver</label>
                  <p className="text-muted-foreground">
                    {selectedSchoolTransport.drivers?.profiles ? 
                      `${selectedSchoolTransport.drivers.profiles.first_name || ''} ${selectedSchoolTransport.drivers.profiles.last_name || ''}`.trim() 
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Vehicle Type</label>
                  <p className="text-muted-foreground">{selectedSchoolTransport.vehicle_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <p className="text-muted-foreground">{selectedSchoolTransport.current_riders || 0}/{selectedSchoolTransport.capacity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Price (Monthly)</label>
                  <p className="text-muted-foreground">R{selectedSchoolTransport.price_per_month}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Pickup Areas</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSchoolTransport.pickup_areas.map((area, index) => (
                    <Badge key={index} variant="secondary">{area}</Badge>
                  ))}
                </div>
              </div>

              {selectedSchoolTransport.drivers?.is_verified && (
                <Badge variant="default">Driver is Verified</Badge>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSchoolDialog(false)}>
              Close
            </Button>
            {selectedSchoolTransport && !selectedSchoolTransport.is_verified && (
              <>
                <Button variant="destructive" onClick={() => handleVerifySchoolTransport(selectedSchoolTransport, false)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => handleVerifySchoolTransport(selectedSchoolTransport, true)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      <DocumentViewer
        documents={documentViewerDocs}
        initialIndex={documentViewerIndex}
        open={showDocumentViewer}
        onClose={() => setShowDocumentViewer(false)}
      />
    </div>
  );
};

export default DriversManagement;
