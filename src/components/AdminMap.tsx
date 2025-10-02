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
  const { data, sendMessage } = useFieldExtension<SelectedLocation | null>(null, {
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
  const [inputValue, setInputValue] = useState("");
  const [currentLocation, setCurrentLocation] =
    useState<SelectedLocation | null>(null);

  useEffect(() => {
    if (data && data.lat && data.lng) {
      const initialPosition = { lat: data.lat, lng: data.lng };
      setCenter(initialPosition);
      setMarkerPosition(initialPosition);
      setZoom(15);
    }
  }, [data]);

  useEffect(() => {
    if (currentLocation) {
      sendMessage({ data: currentLocation });
    }
  }, [currentLocation, sendMessage]);

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
    setInputValue(place.name || "");
    setCurrentLocation(newLocation);
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
        setInputValue(results[0].formatted_address);
      } else {
        newLocation = {
          address: "住所が見つかりません",
          lat: newPosition.lat,
          lng: newPosition.lng,
        };
        setInputValue("住所が見つかりません");
        console.error(
          `Geocode was not successful for the following reason: ${status}`
        );
      }
      setCurrentLocation(newLocation);
    });
  }, []);

  const handleSearch = useCallback(() => {
    if (!inputValue) return;

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    const request = {
      query: inputValue,
      fields: ["name", "geometry", "formatted_address"],
    };

    service.textSearch(request, (results, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        results &&
        results[0]
      ) {
        const place = results[0];
        if (!place.geometry || !place.geometry.location) return;

        const newLocation: SelectedLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || "",
        };

        setCenter({ lat: newLocation.lat, lng: newLocation.lng });
        setMarkerPosition({ lat: newLocation.lat, lng: newLocation.lng });
        setZoom(15);
        setInputValue(place.name || "");
        setCurrentLocation(newLocation);
      } else {
        console.error(
          `Text search was not successful for the following reason: ${status}`
        );
        console.log("指定された施設が見つかりませんでした。");
      }
    });
  }, [inputValue]);

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
          display: "flex",
          alignItems: "center",
        }}
      >
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="施設名で検索"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
        <button
          onClick={handleSearch}
          style={{
            marginLeft: "8px",
            height: "32px",
            padding: "0 12px",
            borderRadius: "3px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            cursor: "pointer",
            color: "black",
            fontSize: "14px",
          }}
        >
          検索
        </button>
      </div>
    </BaseMap>
  );
};

export default AdminMap;

