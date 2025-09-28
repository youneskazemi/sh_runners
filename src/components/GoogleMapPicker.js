'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];
const TEHRAN_CENTER = { lat: 35.6892, lng: 51.3890 };

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export default function GoogleMapPicker({ 
  latitude, 
  longitude, 
  onLocationChange, 
  address, 
  onAddressChange,
  className = "" 
}) {
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [currentPosition, setCurrentPosition] = useState(
    latitude && longitude 
      ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
      : TEHRAN_CENTER
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      const newPos = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
      setCurrentPosition(newPos);
    }
  }, [latitude, longitude]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setCurrentPosition({ lat, lng });
    onLocationChange(lat, lng);
    
    // Reverse geocoding
    reverseGeocode(lat, lng);
  }, [onLocationChange]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({
        location: { lat, lng },
        language: 'fa'
      });
      
      if (response.results[0]) {
        onAddressChange(response.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setCurrentPosition({ lat, lng });
        onLocationChange(lat, lng);
        onAddressChange(place.formatted_address || place.name);
        
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(16);
        }
      }
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCurrentPosition({ lat, lng });
          onLocationChange(lat, lng);
          reverseGeocode(lat, lng);
          
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(16);
          }
          
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsGettingLocation(false);
          // Fallback to Tehran center
          setCurrentPosition(TEHRAN_CENTER);
          onLocationChange(TEHRAN_CENTER.lat, TEHRAN_CENTER.lng);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsGettingLocation(false);
      alert('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Current Location */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <LoadScript
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              libraries={libraries}
              language="fa"
            >
              <Autocomplete
                onLoad={onAutocompleteLoad}
                onPlaceChanged={onPlaceChanged}
              >
                <Input
                  placeholder="جستجو آدرس یا نام مکان..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full"
                />
              </Autocomplete>
            </LoadScript>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center gap-2"
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Target className="h-4 w-4" />
            )}
            موقعیت من
          </Button>
        </div>

        {/* Selected Address Display */}
        {address && (
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-foreground">{address}</p>
              <p className="text-xs text-muted-foreground">
                عرض: {currentPosition.lat.toFixed(6)}, طول: {currentPosition.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Google Map */}
      <div className="border border-border rounded-lg overflow-hidden">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          libraries={libraries}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentPosition}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={onMapClick}
            options={mapOptions}
          >
            <Marker
              position={currentPosition}
              draggable={true}
              onDragEnd={(event) => {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                setCurrentPosition({ lat, lng });
                onLocationChange(lat, lng);
                reverseGeocode(lat, lng);
              }}
            />
          </GoogleMap>
        </LoadScript>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        روی نقشه کلیک کنید یا نشانگر را بکشید تا موقعیت را انتخاب کنید
      </p>
    </div>
  );
}
