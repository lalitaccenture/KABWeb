"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

interface MarkerData {
  position: [number, number]; // Coordinates
  label: string; // Label for the marker
}

const MapAnalysis = () => {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  // Type the markers state correctly
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  // Handle user clicks to add new markers
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const newMarker: MarkerData = {
          position: [e.latlng.lat, e.latlng.lng],
          label: `Marker at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`,
        };
        // Update markers state correctly
        setMarkers((prev) => [...prev, newMarker]);
      },
    });
    return null;
  };

//   OSM - <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//   CartoDB - <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" />
//   CartoDB Dark - <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
//   Stamen Toner - <TileLayer url="https://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png" />
//   Stamen Watercolor - <TileLayer url="https://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg" />
//   OpenTopoMap - <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />

  return (
    <div className="w-full h-full">
      <MapContainer center={[28.6139, 77.2090]} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* <MapClickHandler /> */}
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapAnalysis;
