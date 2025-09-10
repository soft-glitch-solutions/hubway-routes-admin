import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import Overlay from 'ol/Overlay';
import { supabase } from '@/integrations/supabase/client';
import 'ol/ol.css';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<Overlay | null>(null);

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

  // Create styles for markers
  const hubStyle = new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({ color: 'red' }),
      stroke: new Stroke({ color: 'darkred', width: 2 })
    })
  });

  const stopStyle = new Style({
    image: new Circle({
      radius: 6,
      fill: new Fill({ color: 'blue' }),
      stroke: new Stroke({ color: 'darkblue', width: 2 })
    })
  });

  // Create features for hubs and stops
  const hubFeatures = useMemo(() => {
    return hubs.map((hub) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([hub.longitude, hub.latitude])),
        type: 'hub',
        data: hub
      });
      feature.setStyle(hubStyle);
      return feature;
    });
  }, [hubs, hubStyle]);

  const stopFeatures = useMemo(() => {
    return stops.map((stop) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([stop.longitude, stop.latitude])),
        type: 'stop',
        data: stop
      });
      feature.setStyle(stopStyle);
      return feature;
    });
  }, [stops, stopStyle]);

  useEffect(() => {
    if (!mapRef.current || loading) return;

    try {
      // Create popup overlay
      if (popupRef.current && !overlayRef.current) {
        overlayRef.current = new Overlay({
          element: popupRef.current,
          autoPan: {
            animation: {
              duration: 250,
            },
          },
        });
      }

      // Create vector sources
      const hubSource = new VectorSource({
        features: hubFeatures
      });

      const stopSource = new VectorSource({
        features: stopFeatures
      });

      // Create vector layers
      const hubLayer = new VectorLayer({
        source: hubSource
      });

      const stopLayer = new VectorLayer({
        source: stopSource
      });

      // Create map
      if (!mapInstance.current) {
        mapInstance.current = new Map({
          target: mapRef.current,
          layers: [
            new TileLayer({
              source: new OSM()
            }),
            hubLayer,
            stopLayer
          ],
          view: new View({
            center: fromLonLat([22.9375, -30.5595]), // South Africa [lng, lat]
            zoom: 6
          })
        });

        // Add popup overlay
        if (overlayRef.current) {
          mapInstance.current.addOverlay(overlayRef.current);
        }

        // Add click handler for popups
        mapInstance.current.on('click', (event) => {
          const feature = mapInstance.current?.forEachFeatureAtPixel(event.pixel, (feature) => feature);
          
          if (feature && overlayRef.current && popupRef.current) {
            const data = feature.get('data');
            const type = feature.get('type');
            const geometry = feature.getGeometry() as Point;
            const coordinates = geometry?.getCoordinates();
            
            if (data && coordinates) {
              // Update popup content
              if (type === 'hub') {
                popupRef.current.innerHTML = `
                  <div class="p-2 bg-background border rounded shadow-lg">
                    <h3 class="font-semibold text-sm">${data.name}</h3>
                    <p class="text-xs text-muted-foreground">Hub</p>
                    ${data.address ? `<p class="text-xs">${data.address}</p>` : ''}
                  </div>
                `;
              } else {
                popupRef.current.innerHTML = `
                  <div class="p-2 bg-background border rounded shadow-lg">
                    <h3 class="font-semibold text-sm">${data.name}</h3>
                    <p class="text-xs text-muted-foreground">Stop</p>
                  </div>
                `;
              }
              
              overlayRef.current.setPosition(coordinates);
            }
          } else if (overlayRef.current) {
            overlayRef.current.setPosition(undefined);
          }
        });
      } else {
        // Update existing layers
        const layers = mapInstance.current.getLayers();
        layers.removeAt(2); // Remove old stop layer
        layers.removeAt(1); // Remove old hub layer
        layers.insertAt(1, hubLayer);
        layers.insertAt(2, stopLayer);
      }
    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, [hubFeatures, stopFeatures, loading]);

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
        <div 
          ref={mapRef} 
          className="h-96 w-full rounded-lg shadow-lg"
          style={{ height: '384px' }}
        />
        <div ref={popupRef} className="ol-popup" />
        
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