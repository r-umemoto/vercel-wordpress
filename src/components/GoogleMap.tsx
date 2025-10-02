"use client";

import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useFieldExtension } from "microcms-field-extension-react";
import Spinner from "./Spinner";

interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
}

const GoogleMapComponent = ({
  isMicroCMS = false,
}: {
  isMicroCMS?: boolean;
}) => {
  const [libraries] = useState<("places")[]>(["places"]);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: "ja",
  });

  const { data, sendMessage } = useFieldExtension<
    { lat: number; lng: number; address: string } | undefined
  >(undefined, {
    origin: `https://${process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN}.microcms.io`,
    height: 600,
    width: "100%",
    onPostSuccess: () => {
      console.log("microCMSにデータを連携しました");
    },
    onPostError: () => {
      console.log("microCMSへのデータ連携に失敗しました");
    },
  });

  const containerStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
    }),
    []
  );

  const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 });
  const [zoom, setZoom] = useState(12);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (isMicroCMS && data && data.lat && data.lng) {
      if (
        !selectedLocation ||
        data.lat !== selectedLocation.lat ||
        data.lng !== selectedLocation.lng
      ) {
        const initialPosition = { lat: data.lat, lng: data.lng };
        setCenter(initialPosition);
        setMarkerPosition(initialPosition);
        setZoom(15);
        setSelectedLocation({
          lat: data.lat,
          lng: data.lng,
          address: data.address || "",
        });
      }
    }
  }, [isMicroCMS, data, selectedLocation]);

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

    if (isMicroCMS) {
      sendMessage({ data: newLocation });
    }
  }, [autocomplete, isMicroCMS, sendMessage]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const newPosition = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      // Set marker and center map immediately for better UX
      setMarkerPosition(newPosition);
      setCenter(newPosition);
      setZoom(15);

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results, status) => {
        let newLocation: SelectedLocation;

        if (status === "OK" && results?.[0]) {
          // Geocoding successful
          newLocation = {
            address: results[0].formatted_address,
            lat: newPosition.lat,
            lng: newPosition.lng,
          };
        } else {
          // Geocoding failed, use a default address
          newLocation = {
            address: "住所が見つかりません",
            lat: newPosition.lat,
            lng: newPosition.lng,
          };
          console.error(
            `Geocode was not successful for the following reason: ${status}`
          );
        }

        // Update the location details with the address
        setSelectedLocation(newLocation);

        // Send the complete data (with or without address) to microCMS
        if (isMicroCMS) {
          sendMessage({ data: newLocation });
        }
      });
    },
    [isMicroCMS, sendMessage]
  );

  if (!isLoaded) {
    return <Spinner />;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onClick={handleMapClick}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
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
      {!isMicroCMS && selectedLocation && (
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
    </div>
  );
};

export default GoogleMapComponent;
