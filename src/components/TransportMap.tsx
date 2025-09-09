import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hubsResult, stopsResult] = await Promise.all([
          supabase.from('hubs').select('id, name, latitude, longitude, address'),
          supabase.from('stops').select('id, name, latitude, longitude')
        ]);

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

  useEffect(() => {
    if (!mapContainer.current || loading) return;

    // For now, use a placeholder token - this should be replaced with actual Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [22.9375, -30.5595], // Center of South Africa
      zoom: 5.5,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      // Add hubs to map
      hubs.forEach((hub) => {
        const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(
          `<div class="p-2">
            <h3 class="font-semibold text-sm">${hub.name}</h3>
            <p class="text-xs text-gray-600">Hub</p>
            ${hub.address ? `<p class="text-xs">${hub.address}</p>` : ''}
          </div>`
        );

        new mapboxgl.Marker({
          color: '#ef4444', // Red for hubs
          scale: 1.2
        })
          .setLngLat([hub.longitude, hub.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      });

      // Add stops to map
      stops.forEach((stop) => {
        const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(
          `<div class="p-2">
            <h3 class="font-semibold text-sm">${stop.name}</h3>
            <p class="text-xs text-gray-600">Stop</p>
          </div>`
        );

        new mapboxgl.Marker({
          color: '#3b82f6', // Blue for stops
          scale: 0.8
        })
          .setLngLat([stop.longitude, stop.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [hubs, stops, loading]);

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

  return (
    <div className="relative">
      <div ref={mapContainer} className="h-96 rounded-lg shadow-lg" />
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
};

export default TransportMap;