"use client";

import { Autocomplete } from "@react-google-maps/api";
import { useState, useCallback, useEffect } from "react";
import BaseMap from "./BaseMap";

interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
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
