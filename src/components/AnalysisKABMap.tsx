"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet.heat";

interface MarkerData {
  position: [number, number]; 
  label: string; 
}

interface MapAnalysisProps {
  markers: MarkerData[];
  zoom: number;
  center: [number, number];
  heatmapData: [number, number, number][]; // lat, lng, intensity
  stateInfo: { [key: string]: string };
}


const HeatmapLayer: React.FC<{ heatmapData: [number, number, number][] }> = ({ heatmapData }) => {
  const map = useMap();  

  useEffect(() => {
    if (heatmapData.length > 0) {
      // @ts-ignore
      const heat = L.heatLayer(heatmapData, {
        radius: 30,   // Radius of each point in the heatmap
        blur: 15,     // Blur level of the heatmap
        maxZoom: 17,   // Maximum zoom level for the heatmap visibility
        gradient: {
          0.0: "blue",    // Low intensity
          0.2: "cyan",    // Mid intensity
          0.4: "lime",    // Higher intensity
          0.6: "yellow",  // Higher intensity
          0.8: "orange",  // Even higher intensity
          1.0: "red",     // Highest intensity
        },
      });
      heat.addTo(map); // Add the heatmap layer to the map
    }
  }, [heatmapData, map]);  // Re-run the effect when `heatmapData` changes

  return null;  // This component doesn't render anything directly
};

const MapAnalysis: React.FC<MapAnalysisProps> = ({ markers, zoom, center, heatmapData, stateInfo }) => {

  return (
    <div className="w-full h-full">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Heatmap layer */}
        <HeatmapLayer heatmapData={heatmapData} />

         {/* Render markers for each state with popups */}
        {Object.keys(stateInfo).map((state, index) => {
          const stateCoords = markers[index]?.position; // Coordinates for the state's marker
          return (
            <Marker key={state} position={stateCoords} opacity={0} eventHandlers={{
              click: () => alert(stateInfo[state]), // Popup logic with state info
            }}>
              <Popup>{stateInfo[state]}</Popup>
            </Marker>
          );
        })}
        
        {/* Render markers */}
        {markers?.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapAnalysis;
