import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGoogleMap } from "@react-google-maps/api";

interface AdvancedMarkerProps {
  position: google.maps.LatLngLiteral;
  children: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
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

    const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content,
    });

    setMarker(advancedMarker);

    return () => {
      advancedMarker.map = null;
    };
  }, [map, content, position]);

  useEffect(() => {
    if (!content || !onClick) return;

    content.addEventListener("click", onClick);
    return () => {
      content.removeEventListener("click", onClick);
    };
  }, [content, onClick]);

  useEffect(() => {
    if (marker) {
      marker.zIndex = zIndex;
    }
  }, [marker, zIndex]);

  return content ? createPortal(children, content) : null;
};

export default AdvancedMarkerWrapper;
