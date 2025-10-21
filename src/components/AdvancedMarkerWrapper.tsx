import { useGoogleMap } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AdvancedMarkerProps {
  position: google.maps.LatLngLiteral;
  children: React.ReactNode;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  zIndex?: number;
}

const AdvancedMarkerWrapper = ({ position, children, onClick, zIndex }: AdvancedMarkerProps) => {
  const map = useGoogleMap();
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement>();
  const [content, setContent] = useState<HTMLDivElement>();

  useEffect(() => {
    const div = document.createElement("div");
    setContent(div);
  }, []);

  useEffect(() => {
    if (!map || !content) return;

    const markerInstance = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content,
    });

    setMarker(markerInstance);

    return () => {
      markerInstance.map = null;
    };
  }, [map, content, position]);

  useEffect(() => {
    if (!marker || !onClick) return;
    const listener = marker.addListener("click", onClick);
    return () => {
      listener.remove();
    };
  }, [marker, onClick]);

  useEffect(() => {
    if (marker) {
      marker.zIndex = zIndex;
    }
  }, [marker, zIndex]);

  return content ? createPortal(children, content) : null;
};

export default AdvancedMarkerWrapper;
