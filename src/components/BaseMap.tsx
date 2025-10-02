"use client";

import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import Spinner from "./Spinner";

interface BaseMapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  markerPosition: google.maps.LatLngLiteral | null;
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
  mapContainerStyle?: React.CSSProperties;
}

const BaseMap = ({
  center,
  zoom,
  markerPosition,
  onMapClick,
  children,
  mapContainerStyle,
}: BaseMapProps) => {
  const [libraries] = useState<("places")[]>(["places"]);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: "ja",
  });

  const defaultContainerStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
    }),
    []
  );

  if (!isLoaded) {
    return <Spinner />;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle || defaultContainerStyle}
        center={center}
        zoom={zoom}
        onClick={onMapClick}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
      {children}
    </div>
  );
};

export default BaseMap;
