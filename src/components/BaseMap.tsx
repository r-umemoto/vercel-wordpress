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
  wrapperStyle?: React.CSSProperties; // New prop
}

const BaseMap = ({
  center,
  zoom,
  markerPosition,
  onMapClick,
  children,
  mapContainerStyle,
  wrapperStyle, // New prop
}: BaseMapProps) => {
  const [libraries] = useState<("places" | "marker")[]>(["places", "marker"]);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: "ja",
    mapIds: [process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID || ""],
  });

  const defaultMapContainerStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
    }),
    []
  );

  const defaultWrapperStyle = {
    position: "relative" as const,
    width: "100%",
    height: "600px",
  };

  const mapOptions = useMemo(() => ({
    mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
  }), []);

  if (!isLoaded) {
    return <Spinner />;
  }

  return (
    <div style={wrapperStyle || defaultWrapperStyle}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle || defaultMapContainerStyle}
        center={center}
        zoom={zoom}
        onClick={onMapClick}
        options={mapOptions}
      >
        {markerPosition && <Marker position={markerPosition} />}
        {children}
      </GoogleMap>
    </div>
  );
};

export default BaseMap;