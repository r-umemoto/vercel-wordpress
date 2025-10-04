import { Autocomplete } from "@react-google-maps/api";
import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import BaseMap from "./BaseMap";
import styles from "./PublicMap.module.css";
import AdvancedMarkerWrapper from "./AdvancedMarkerWrapper";

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
  pickup?: boolean;
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
  type?: string; // Add type for icon
}

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

const PublicMap = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState({ lat: 35.6895, lng: 139.6917 });
  const [zoom, setZoom] = useState(10);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [parks, setParks] = useState<Park[]>([]);
  const [highlightedParkId, setHighlightedParkId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParkForModal, setSelectedParkForModal] = useState<Park | null>(
    null
  );
  const [isClient, setIsClient] = useState(false);
  const justOpenedModal = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const findAndSetNearbyParks = useCallback(async (location: google.maps.LatLngLiteral) => {
    try {
      const response = await fetch("/api/parks?limit=50"); // Fetch more parks
      const data = await response.json();
      const allParks: Park[] = data.contents.map((park: Park) => ({ ...park, type: 'house' })); // Add default type

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
  }, []);

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
          setZoom(10);
          findAndSetNearbyParks(newLocation);
        },
        () => {
          console.error("Error: The Geolocation service failed.");
        }
      );
    } else {
      console.error("Error: Your browser doesn't support geolocation.");
    }
  }, [findAndSetNearbyParks]);

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
  }, [autocomplete, findAndSetNearbyParks]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    setHighlightedParkId(null); // Unhighlight on map click

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
  }, [findAndSetNearbyParks]);

  const handleParkClick = useCallback(
    (park: Park) => {
      if (justOpenedModal.current) {
        justOpenedModal.current = false;
        return;
      }

      if (highlightedParkId === park.id) {
        setHighlightedParkId(null);
        return;
      }

      if (!map || !park.map) return;

      const bounds = map.getBounds();
      if (!bounds) {
        map.panTo({ lat: park.map.lat, lng: park.map.lng });
        setHighlightedParkId(park.id);
        return;
      }

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      const latSpan = ne.lat() - sw.lat();
      const lngSpan = ne.lng() - sw.lng();

      const latInset = latSpan * 0.25;
      const lngInset = lngSpan * 0.2;

      const safeBounds = {
        north: ne.lat() - latInset,
        south: sw.lat() + latInset,
        east: ne.lng() - lngInset,
        west: sw.lng() + lngInset,
      };

      const isInsideSafeBounds =
        park.map.lat < safeBounds.north &&
        park.map.lat > safeBounds.south &&
        park.map.lng < safeBounds.east &&
        park.map.lng > safeBounds.west;

      if (!isInsideSafeBounds) {
        map.panTo({ lat: park.map.lat, lng: park.map.lng });
      }

      setHighlightedParkId(park.id);
    },
    [map, highlightedParkId]
  );

  const handleOpenModal = (park: Park) => {
    setSelectedParkForModal(park);
    setModalOpen(true);
    justOpenedModal.current = true;
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedParkForModal(null);
  };

  return (
    <>
      <BaseMap
        center={center}
        zoom={zoom}
        markerPosition={markerPosition}
        onMapClick={handleMapClick}
        onLoad={onMapLoad}
        wrapperStyle={{ position: "relative", width: "100%", height: "100%" }}
      >
        {parks.map((park) => (
          park.map && (
            <AdvancedMarkerWrapper
              key={park.id}
              position={{ lat: park.map.lat, lng: park.map.lng }}
              zIndex={highlightedParkId === park.id ? 1 : 0}
              onClick={() => handleParkClick(park)}
            >
              <div
                className={`${styles.property} ${styles[park.type || 'house']} ${highlightedParkId === park.id ? styles.highlight : ''}`}>
                <div className={styles.icon}>
                  <i aria-hidden="true" className={`fa fa-icon fa-${park.type}`} title={park.type}>{park.name}</i>
                  <span className="fa-sr-only">{park.type}</span>
                </div>
                <div className={styles.details}>
                  {highlightedParkId === park.id && (
                    <>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{park.name}</h2>
                      {park.thumbnail && (
                        <div style={{ position: 'relative', width: '100%', height: '150px', margin: '10px 0' }}>
                          <Image
                            src={park.thumbnail.url}
                            alt={park.name}
                            fill
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </div>
                      )}
                      {park.map?.address && <p className={styles.address}>{park.map.address}</p>}
                      {park.content && (
                        <div
                          className={styles.parkContent}
                          style={{ marginTop: '15px', fontSize: '0.9rem' }}
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(park.content) }}
                        />
                      )}
                      <button
                        onPointerUp={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleOpenModal(park);
                        }}
                        className={styles.modalButton}>
                        詳細を見る
                      </button>
                    </>
                  )}
                </div>
              </div>
            </AdvancedMarkerWrapper>
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
      {isClient && modalOpen && selectedParkForModal && createPortal(
        <div
          className={styles.modalOverlay}
          onClick={handleCloseModal}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className={styles.closeButton}
            >
              &times;
            </button>
            <h2>{selectedParkForModal.name}</h2>
            {selectedParkForModal.thumbnail && (
              <div style={{ position: 'relative', width: '100%', height: '200px', margin: '10px 0' }}>
                <Image
                  src={selectedParkForModal.thumbnail.url}
                  alt={selectedParkForModal.name}
                  fill
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
            )}
            {selectedParkForModal.pickup && <p style={{ color: 'red', fontWeight: 'bold' }}>Pickup!</p>}
            {selectedParkForModal.description && <p>{selectedParkForModal.description}</p>}
            {selectedParkForModal.map?.address && <p>{selectedParkForModal.map.address}</p>}
            {selectedParkForModal.content && (
              <div
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedParkForModal.content) }}
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PublicMap;
