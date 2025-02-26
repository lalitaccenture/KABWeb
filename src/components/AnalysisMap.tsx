"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

interface MarkerData {
  latitude: number;       // Latitude of the marker
  longitude: number;      // Longitude of the marker
  litter_quantity: number; // Amount of litter at the marker
  cleanup_year: number;   // Year of the cleanup event
}


interface MapAnalysisProps {
  markers: MarkerData[]; 
  zoom: number;
  center: [number, number];
}

const MapAnalysis: React.FC<MapAnalysisProps> = ({ markers, zoom, center }) => {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  console.log("markers",markers)

  return (
    <div className="w-full h-full">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers?.map((marker, index) => (
          <Marker key={index} position={{ lat: marker.latitude, lng: marker.longitude }}>
            <Popup>
              {/* Display relevant information about the marker */}
      Litter Quantity: {marker.litter_quantity} <br />
      Cleanup Year: {marker.cleanup_year}
              </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapAnalysis;
