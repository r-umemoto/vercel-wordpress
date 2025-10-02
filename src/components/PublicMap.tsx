import { Autocomplete, Marker, OverlayView } from "@react-google-maps/api";
import { useState, useCallback, useEffect } from "react";
import BaseMap from "./BaseMap";

interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
}

// 公園の型定義
export interface Park {
  id: string;
  name: string;
  description?: string;
  content?: string;
  thumbnail?: {
    url: string;
    height: number;
    width: number;
  };
  map?: {
    lng: number;
    lat: number;
    address: string;
  };
}

const PublicMap = () => {
  const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 });
  const [zoom, setZoom] = useState(12);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [parks, setParks] = useState<Park[]>([]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const findAndSetNearbyParks = async (location: google.maps.LatLngLiteral) => {
    try {
      const response = await fetch("/api/parks");
      const data = await response.json();
      const allParks: Park[] = data.contents;

      const nearbyParks = allParks.filter((park) => {
        if (park.map) {
          const distance = calculateDistance(
            location.lat,
            location.lng,
            park.map.lat,
            park.map.lng
          );
          return distance <= 100;
        }
        return false;
      });

      setParks(nearbyParks);
    } catch (error) {
      console.error("Failed to fetch or process parks:", error);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(newLocation);
          setMarkerPosition(newLocation);
          setZoom(15);
          findAndSetNearbyParks(newLocation);
        },
        () => {
          console.error("Error: The Geolocation service failed.");
        }
      );
    } else {
      console.error("Error: Your browser doesn't support geolocation.");
    }
  }, []);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = useCallback(() => {
    if (autocomplete === null) return;

    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) return;

    const newLocation: SelectedLocation = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      address: place.formatted_address || "",
    };

    setCenter({ lat: newLocation.lat, lng: newLocation.lng });
    setMarkerPosition({ lat: newLocation.lat, lng: newLocation.lng });
    setSelectedLocation(newLocation);
    setZoom(15);
    findAndSetNearbyParks(newLocation);
  }, [autocomplete]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    setMarkerPosition(newPosition);
    setCenter(newPosition);
    setZoom(15);
    findAndSetNearbyParks(newPosition);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: e.latLng }, (results, status) => {
      let newLocation: SelectedLocation;

      if (status === "OK" && results?.[0]) {
        newLocation = {
          address: results[0].formatted_address,
          lat: newPosition.lat,
          lng: newPosition.lng,
        };
      } else {
        newLocation = {
          address: "住所が見つかりません",
          lat: newPosition.lat,
          lng: newPosition.lng,
        };
        console.error(
          `Geocode was not successful for the following reason: ${status}`
        );
      }
      setSelectedLocation(newLocation);
    });
  }, []);

  return (
    <BaseMap
      center={center}
      zoom={zoom}
      markerPosition={markerPosition}
      onMapClick={handleMapClick}
      wrapperStyle={{ position: "relative", width: "100%", height: "100%" }}
    >
      {parks.map((park) => (
        park.map && (
          <OverlayView
            key={park.id}
            position={{ lat: park.map.lat, lng: park.map.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                backgroundColor: "rgba(255, 255, 0, 0.7)",
                padding: "8px 12px",
                borderRadius: "3px",
                color: "black",
                fontSize: "20px",
                whiteSpace: "nowrap",
              }}
            >
              {park.name}
            </div>
          </OverlayView>
        )
      ))}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
        }}
      >
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="場所を検索"
            style={{
              boxSizing: `border-box`,
              border: `1px solid transparent`,
              width: `240px`,
              height: `32px`,
              padding: `0 12px`,
              borderRadius: `3px`,
              boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
              fontSize: `14px`,
              outline: `none`,
              textOverflow: `ellipses`,
              backgroundColor: "white",
              color: "black",
            }}
          />
        </Autocomplete>
      </div>
      {selectedLocation && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
            zIndex: 1,
            color: "black",
          }}
        >
          <h3>選択中の地点</h3>
          <p>緯度: {selectedLocation.lat}</p>
          <p>経度: {selectedLocation.lng}</p>
          <p>住所: {selectedLocation.address}</p>
        </div>
      )}
    </BaseMap>
  );
};

export default PublicMap;
