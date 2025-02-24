"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet.heat"

interface MarkerData {
  position: [number, number]; // Coordinates
  label: string; // Label for the marker
}

interface MapAnalysisProps {
  markers: MarkerData[]; 
  zoom: number;
  center: [number, number];
  heatmapData : [number, number, number][];
}

// Custom component to handle adding the heatmap layer
const HeatmapLayer: React.FC<{ heatmapData: [number, number, number][] }> = ({ heatmapData }) => {
  const map = useMap();  // Access the Leaflet map instance

  useEffect(() => {
    if (heatmapData.length > 0) {
      // @ts-ignore
      const heat = L.heatLayer(heatmapData, {
        radius: 80,   // Radius of each point in the heatmap
        blur: 15,     // Blur level of the heatmap
        maxZoom: 17,   // Maximum zoom level for the heatmap visibility
        gradient: {
          0.0: "blue",    // Low intensity
          0.2: "cyan",    // Mid intensity
          0.4: "lime",    // Higher intensity
          0.6: "yellow",  // Higher intensity
          0.8: "orange",  // Even higher intensity
          1.0: "red",     // Highest intensity
        }
      });
      heat.addTo(map); // Add the heatmap layer to the map
    }
  }, [heatmapData, map]);  // Re-run the effect when `heatmapData` changes

  return null;  // This component doesn't render anything directly
};

// useEffect(() => {
  //   if (heatmapData.length > 0) {
  //     const heat = L.heatLayer(heatmapData, {
  //       radius: 25,   // Radius of each point in the heatmap
  //       blur: 15,     // Blur level of the heatmap
  //       maxZoom: 17   // Maximum zoom level for the heatmap visibility
  //     });
  //     heat.addTo(map); // Add heatmap layer to the map
  //   }
  // }, [heatmapData]);  // Dependency on heatmapData

const MapAnalysis: React.FC<MapAnalysisProps> = ({ markers, zoom, center,heatmapData }) => {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="w-full h-full">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Render the heatmap layer */}
        <HeatmapLayer heatmapData={heatmapData} />
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
