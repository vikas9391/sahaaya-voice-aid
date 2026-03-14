import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  lat: number;
  lng: number;
  label: string;
}

interface MapViewProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
}

const MapView = ({ markers, center = [22, 78], zoom = 5 }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');

      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, { scrollWheelZoom: false }).setView(center, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      markers.forEach(m => {
        L.marker([m.lat, m.lng]).addTo(map).bindPopup(m.label);
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [markers, center, zoom]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapView;
