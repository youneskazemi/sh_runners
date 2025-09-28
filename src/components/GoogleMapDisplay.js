'use client';

import { useState, useCallback } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '8px'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: 'cooperative',
};

export default function GoogleMapDisplay({ 
  latitude, 
  longitude, 
  address,
  title,
  showDirections = true,
  showInfoWindow = false,
  className = "" 
}) {
  const [map, setMap] = useState(null);
  const [showInfo, setShowInfo] = useState(showInfoWindow);

  const position = {
    lat: parseFloat(latitude),
    lng: parseFloat(longitude)
  };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const getDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (userPosition) => {
          const userLat = userPosition.coords.latitude;
          const userLng = userPosition.coords.longitude;
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

      {/* Google Map */}
      <div className="border border-border rounded-lg overflow-hidden">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={position}
            zoom={16}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
          >
            <Marker
              position={position}
              onClick={() => setShowInfo(!showInfo)}
            />
            
            {showInfo && (
              <InfoWindow
                position={position}
                onCloseClick={() => setShowInfo(false)}
              >
                <div className="p-2 max-w-xs">
                  {title && <h3 className="font-semibold text-sm mb-1">{title}</h3>}
                  {address && <p className="text-xs text-gray-600">{address}</p>}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Action Buttons */}
      {showDirections && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={getDirections}
            className="flex-1 flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            مسیریابی
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openInGoogleMaps}
            className="flex-1 flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            باز کردن در گوگل مپ
          </Button>
        </div>
      )}
    </div>
  );
}
