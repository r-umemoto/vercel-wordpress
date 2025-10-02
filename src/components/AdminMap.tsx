"use client";

import { Autocomplete } from "@react-google-maps/api";
import { useState, useEffect, useCallback } from "react";
import { useFieldExtension } from "microcms-field-extension-react";
import BaseMap from "./BaseMap";

interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
}

const AdminMap = () => {
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

  const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 });
  const [zoom, setZoom] = useState(12);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (data && data.lat && data.lng) {
      const initialPosition = { lat: data.lat, lng: data.lng };
      setCenter(initialPosition);
      setMarkerPosition(initialPosition);
      setZoom(15);
    }
  }, [data]);

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
    setZoom(15);

    sendMessage({ data: newLocation });
  }, [autocomplete, sendMessage]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
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

        sendMessage({ data: newLocation });
      });
    },
    [sendMessage]
  );

  return (
    <BaseMap
      center={center}
      zoom={zoom}
      markerPosition={markerPosition}
      onMapClick={handleMapClick}
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
    </BaseMap>
  );
};

export default AdminMap;
