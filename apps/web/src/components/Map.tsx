"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import L from "leaflet";

// Fix for default marker icon
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom user location icon - pulsing green marker
const userLocationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom tool marker icon - purple/violet
const toolMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Define Item interface
interface Item {
  id: string;
  title: string;
  description: string | null;
  price_per_day: number;
  location: {
    coordinates: [number, number];
  };
}

// Location status types
type LocationStatus = "loading" | "success" | "error" | "permission-denied" | "unsupported";

// Helper to center map when user location changes
function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => { 
    map.setView(coords); 
  }, [map, coords]);
  return null;
}

// Map control component for zoom buttons
function MapControls({ onZoomIn, onZoomOut, onLocate }: { onZoomIn: () => void; onZoomOut: () => void; onLocate: () => void }) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button 
        onClick={onZoomIn}
        className="w-10 h-10 bg-gray-900/90 hover:bg-indigo-600 text-white rounded-lg shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        title="Zoom In"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button 
        onClick={onZoomOut}
        className="w-10 h-10 bg-gray-900/90 hover:bg-indigo-600 text-white rounded-lg shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        title="Zoom Out"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <button 
        onClick={onLocate}
        className="w-10 h-10 bg-gray-900/90 hover:bg-green-600 text-white rounded-lg shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        title="My Location"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}

export default function Map() {
  const [items, setItems] = useState<Item[]>([]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [mapZoom, setMapZoom] = useState(14);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrice, setFilterPrice] = useState<number>(100);
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const fetchNearbyItems = useCallback((lat: number, lng: number) => {
    fetch(`http://localhost:3001/items/nearby?lat=${lat}&lng=${lng}`)
      .then(res => res.json())
      .then(data => {
        // Ensure data is always an array
        if (Array.isArray(data)) {
          setItems(data);
        } else if (data && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          console.log("API response:", data);
          setItems([]);
        }
      })
      .catch(_err => {
        console.error("Fetch error:", _err);
        setItems([]);
      });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      setErrorMessage("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPos([latitude, longitude]);
        setLocationStatus("success");
        fetchNearbyItems(latitude, longitude);
      },
      (_err) => {
        setLocationStatus("error");
        setErrorMessage("Unable to retrieve your location. Please enable location access.");
      }
    );
  }, [fetchNearbyItems]);

  const handleBooking = async (itemId: string) => {
    const token = localStorage.getItem("supabase_token");
    const userId = localStorage.getItem("user_id");
    
    if (!token || !userId) {
      alert("Please log in to borrow items");
      return;
    }

    const now = new Date();
    const startDate = now.toISOString();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = futureDate.toISOString();

    try {
      const response = await fetch("http://localhost:3001/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId,
          borrowerId: userId,
          startDate,
          endDate,
        }),
      });

      if (response.ok) {
        alert("Booking request sent successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to create booking");
    }
  };

  const requestLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPos([latitude, longitude]);
        setLocationStatus("success");
        fetchNearbyItems(latitude, longitude);
      },
      (_err) => {
        setLocationStatus("permission-denied");
        setErrorMessage("Location permission denied. Please enable it in your browser settings.");
      }
    );
  };

  // Filter items based on search and price
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrice = item.price_per_day <= filterPrice;
    return matchesSearch && matchesPrice;
  });

  // Handle zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleLocate = () => {
    if (mapRef.current && userPos) {
      mapRef.current.setView(userPos, 14);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-gray-900/50 rounded-xl">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Finding your location...</p>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="w-full">
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl mb-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Location Access Required</p>
            <p className="text-sm text-red-400/80">{errorMessage}</p>
          </div>
        </div>
      </div>
      {locationStatus !== "unsupported" && (
        <button 
          onClick={requestLocationPermission}
          className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          Enable Location Access
        </button>
      )}
      <div className="mt-4 w-full rounded-xl overflow-hidden border border-white/10">
        <MapContainer center={[20, 0]} zoom={2} style={{ height: "300px", width: "100%" }}>
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
        </MapContainer>
      </div>
    </div>
  );

  // Map Controls wrapper
  function MapControlsWrapper() {
    const map = useMap();
    mapRef.current = map;
    
    return (
      <MapControls 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
        onLocate={handleLocate}
      />
    );
  }

  // Show loading state
  if (locationStatus === "loading") {
    return <LoadingSkeleton />;
  }

  // Show error state
  if (locationStatus === "error" || locationStatus === "permission-denied" || locationStatus === "unsupported") {
    return <ErrorState />;
  }

  // Render map if we have a position
  if (!userPos) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="relative">
      {/* Search and Filter Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-white/10 p-3 shadow-2xl">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                showFilters 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-gray-800/50 border-white/10 text-gray-400 hover:border-indigo-500 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm whitespace-nowrap">Max Price:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-indigo-400 font-medium min-w-[60px] text-right">${filterPrice}/day</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Count Badge */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-gray-900/95 backdrop-blur-md rounded-lg border border-white/10 px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">{filteredItems.length}</span>
            <span className="text-gray-400 text-sm">tools nearby</span>
          </div>
        </div>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div className="bg-gray-900/95 backdrop-blur-md rounded-lg border border-white/10 px-3 py-1 shadow-lg">
          <span className="text-gray-400 text-xs">Zoom: {mapZoom}x</span>
        </div>
      </div>

      {/* Main Map */}
      <MapContainer 
        center={userPos} 
        zoom={14} 
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <RecenterMap coords={userPos} />
        <MapControlsWrapper />
        
        {/* Search radius circle */}
        <Circle 
          center={userPos} 
          radius={2000}
          pathOptions={{
            color: '#6366f1',
            fillColor: '#6366f1',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 10'
          }}
        />
        
        {/* User Location Marker with pulse effect */}
        <Marker position={userPos} icon={userLocationIcon}>
          <Popup>
            <div className="text-center p-1">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2 animate-pulse"></div>
              <strong className="text-green-400 font-semibold">You are here</strong>
              <p className="text-xs text-gray-500 mt-1">Your current location</p>
            </div>
          </Popup>
        </Marker>
        
        {/* Items Markers */}
        {filteredItems.map((item: Item) => (
          <Marker 
            key={item.id} 
            position={[item.location.coordinates[1], item.location.coordinates[0]]}
            icon={toolMarkerIcon}
          >
            <Popup>
              <div className="min-w-[220px] p-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    Available
                  </span>
                </div>
                
                {/* Price */}
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-2 mb-3">
                  <span className="text-cyan-400 font-bold text-2xl">${item.price_per_day}</span>
                  <span className="text-gray-400 text-sm">/day</span>
                </div>
                
                {/* Description */}
                {item.description && (
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.description}</p>
                )}
                
                {/* Distance indicator */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>Within 2km</span>
                </div>
                
                {/* Action Button */}
                <button 
                  onClick={() => handleBooking(item.id)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
                >
                  Request to Borrow
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
