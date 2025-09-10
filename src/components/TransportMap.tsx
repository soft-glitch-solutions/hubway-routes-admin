import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons
const hubIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const stopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -27],
  shadowSize: [32, 32]
});

interface Hub {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const TransportMap = () => {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('TransportMap render:', { hubsLength: hubs.length, stopsLength: stops.length, loading });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching map data...');
        const [hubsResult, stopsResult] = await Promise.all([
          supabase.from('hubs').select('id, name, latitude, longitude, address'),
          supabase.from('stops').select('id, name, latitude, longitude')
        ]);

        console.log('Map data fetched:', { hubs: hubsResult.data?.length, stops: stopsResult.data?.length });
        if (hubsResult.data) setHubs(hubsResult.data);
        if (stopsResult.data) setStops(stopsResult.data);
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoize markers to prevent re-rendering issues
  const hubMarkers = useMemo(() => {
    return hubs.map((hub) => (
      <Marker
        key={`hub-${hub.id}`}
        position={[hub.latitude, hub.longitude]}
        icon={hubIcon}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold text-sm">{hub.name}</h3>
            <p className="text-xs text-muted-foreground">Hub</p>
            {hub.address && <p className="text-xs">{hub.address}</p>}
          </div>
        </Popup>
      </Marker>
    ));
  }, [hubs]);

  const stopMarkers = useMemo(() => {
    return stops.map((stop) => (
      <Marker
        key={`stop-${stop.id}`}
        position={[stop.latitude, stop.longitude]}
        icon={stopIcon}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold text-sm">{stop.name}</h3>
            <p className="text-xs text-muted-foreground">Stop</p>
          </div>
        </Popup>
      </Marker>
    ));
  }, [stops]);

  if (loading) {
    return (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="relative">
        <MapContainer
          center={[-30.5595, 22.9375]}
          zoom={6}
          style={{ height: '384px', width: '100%' }}
          className="rounded-lg shadow-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Render all markers without conditional checks inside MapContainer */}
          {hubMarkers}
          {stopMarkers}
        </MapContainer>
        
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Hubs ({hubs.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Stops ({stops.length})</span>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('MapContainer render error:', error);
    return (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Map failed to load</p>
        </div>
      </div>
    );
  }
};

export default TransportMap;