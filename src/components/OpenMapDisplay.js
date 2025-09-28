'use client';

import { useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function OpenMapDisplay({ 
  latitude, 
  longitude, 
  address,
  title,
  showDirections = true,
  className = "" 
}) {
  const position = [parseFloat(latitude), parseFloat(longitude)];

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const openInOpenStreetMap = () => {
    const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=16`;
    window.open(url, '_blank');
  };

  const getDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (userPosition) => {
          const userLat = userPosition.coords.latitude;
          const userLng = userPosition.coords.longitude;
          // Open in Google Maps for directions (most reliable)
          const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${latitude},${longitude}`;
          window.open(url, '_blank');
        },
        () => {
          // Fallback: just open destination
          const url = `https://www.google.com/maps/dir//${latitude},${longitude}`;
          window.open(url, '_blank');
        }
      );
    } else {
      // Fallback: just open destination
      const url = `https://www.google.com/maps/dir//${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  };

  if (!latitude || !longitude) {
    return (
      <div className={`bg-muted/30 rounded-lg p-8 text-center ${className}`}>
        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">موقعیت مکانی تعریف نشده</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Address Info */}
      {address && (
        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-foreground">{address}</p>
            <p className="text-xs text-muted-foreground">
              عرض: {parseFloat(latitude).toFixed(6)}, طول: {parseFloat(longitude).toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* OpenStreetMap */}
      <div className="border border-border rounded-lg overflow-hidden h-[250px]">
        {typeof window !== 'undefined' && (
          <MapContainer
            center={position}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
            dragging={true}
            touchZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              {(title || address) && (
                <Popup>
                  <div className="p-2 max-w-xs">
                    {title && <h3 className="font-semibold text-sm mb-1">{title}</h3>}
                    {address && <p className="text-xs text-gray-600">{address}</p>}
                  </div>
                </Popup>
              )}
            </Marker>
          </MapContainer>
        )}
      </div>

      {/* Action Buttons */}
      {showDirections && (
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={getDirections}
            className="flex items-center gap-1 text-xs"
          >
            <Navigation className="h-3 w-3" />
            مسیریابی
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openInGoogleMaps}
            className="flex items-center gap-1 text-xs"
          >
            <ExternalLink className="h-3 w-3" />
            گوگل مپ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openInOpenStreetMap}
            className="flex items-center gap-1 text-xs"
          >
            <MapPin className="h-3 w-3" />
            OSM
          </Button>
        </div>
      )}
    </div>
  );
}
