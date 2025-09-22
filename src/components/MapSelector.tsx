import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { fromLonLat, toLonLat } from 'ol/proj';
import { MapPin, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  height?: string;
}

const MapSelector: React.FC<MapSelectorProps> = ({ 
  onLocationSelect, 
  initialLat, 
  initialLng, 
  height = '400px' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const { toast } = useToast();

  // Marker style
  const markerStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>
          <circle cx="16" cy="12" r="4" fill="white"/>
        </svg>
      `),
      scale: 1,
    }),
  });

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: markerStyle,
    });

    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([28.0473, -26.2041]), // Johannesburg default
        zoom: 10,
      }),
    });

    // Add initial marker if coordinates provided
    if (initialLat && initialLng) {
      const marker = new Feature({
        geometry: new Point(fromLonLat([initialLng, initialLat])),
      });
      vectorSource.addFeature(marker);
      mapInstance.getView().setCenter(fromLonLat([initialLng, initialLat]));
      mapInstance.getView().setZoom(15);
    }

    // Handle map clicks
    mapInstance.on('singleclick', (event) => {
      const coords = toLonLat(event.coordinate);
      const [lng, lat] = coords;
      
      // Clear existing markers
      vectorSource.clear();
      
      // Add new marker
      const marker = new Feature({
        geometry: new Point(event.coordinate),
      });
      vectorSource.addFeature(marker);
      
      setSelectedCoords([lat, lng]);
      onLocationSelect(lat, lng);
      
      toast({
        title: "Location Selected",
        description: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    });

    setMap(mapInstance);

    return () => {
      mapInstance.setTarget(undefined);
    };
  }, [initialLat, initialLng, onLocationSelect, toast]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (map) {
          const coords = fromLonLat([longitude, latitude]);
          map.getView().setCenter(coords);
          map.getView().setZoom(15);
          
          // Clear existing markers and add user location marker
          const vectorLayer = map.getLayers().getArray()[1] as VectorLayer<VectorSource>;
          const vectorSource = vectorLayer.getSource();
          if (vectorSource) {
            vectorSource.clear();
            
            const marker = new Feature({
              geometry: new Point(coords),
            });
            vectorSource.addFeature(marker);
          }
          
          setSelectedCoords([latitude, longitude]);
          onLocationSelect(latitude, longitude);
          
          toast({
            title: "Location Found",
            description: `Moved to your current location`,
          });
        }
      },
      (error) => {
        toast({
          title: "Error",
          description: "Failed to get your location. Please try again.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          Click on the map to select location
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className="transport-button-secondary"
        >
          <Target className="w-4 h-4 mr-1" />
          Use My Location
        </Button>
      </div>
      
      <div 
        ref={mapRef}
        style={{ height }}
        className="w-full border rounded-lg shadow-sm"
      />
      
      {selectedCoords && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          Selected: {selectedCoords[0].toFixed(6)}, {selectedCoords[1].toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default MapSelector;