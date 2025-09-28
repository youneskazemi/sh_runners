'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

// Tehran center coordinates
const TEHRAN_CENTER = [35.6892, 51.3890];

export default function SimpleMapPicker({ 
  latitude, 
  longitude, 
  onLocationChange, 
  address, 
  onAddressChange,
  className = "" 
}) {
  const [mapPosition, setMapPosition] = useState(
    latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : TEHRAN_CENTER
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setMapPosition([parseFloat(latitude), parseFloat(longitude)]);
    }
  }, [latitude, longitude]);

  const handleLocationSelect = (lat, lng) => {
    setMapPosition([lat, lng]);
    onLocationChange(lat, lng);
    
    // Reverse geocoding using Nominatim (free)
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        onAddressChange(data.display_name);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Using Nominatim for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=fa&limit=1&countrycodes=ir`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        handleLocationSelect(lat, lng);
      } else {
        alert('مکان مورد نظر یافت نشد');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('خطا در جستجو');
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          handleLocationSelect(lat, lng);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsGettingLocation(false);
          alert('خطا در دریافت موقعیت مکانی');
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

  // Simple map click handler
  const handleMapClick = (e) => {
    if (e && e.latlng) {
      const { lat, lng } = e.latlng;
      handleLocationSelect(lat, lng);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Current Location */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="جستجو آدرس یا نام مکان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center gap-2"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
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
          </Button>
        </div>

        {/* Selected Address Display */}
        {address && (
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-foreground">{address}</p>
              <p className="text-xs text-muted-foreground">
                عرض: {mapPosition[0].toFixed(6)}, طول: {mapPosition[1].toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Simple OpenStreetMap */}
      <div className="border border-border rounded-lg overflow-hidden h-[300px]">
        {typeof window !== 'undefined' && (
          <MapContainer
            center={mapPosition}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            touchZoom={true}
            dragging={true}
            onclick={handleMapClick}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapPosition} />
          </MapContainer>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        روی نقشه کلیک کنید تا موقعیت را انتخاب کنید
      </p>
    </div>
  );
}
