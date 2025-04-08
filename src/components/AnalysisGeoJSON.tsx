"use client";

import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

import { FeatureCollection } from "geojson";

// Import and typecast GeoJSON data
import usStatesGeoJSONRaw from "../../public/us-states.json";
import React from "react";
// import usStatesGeoJSONRaw from "../../public/us-states-new.json";
const usStatesGeoJSON: FeatureCollection = usStatesGeoJSONRaw as FeatureCollection;

// Convert StaticImageData to string
const markerIconUrl = (markerIconPng as unknown) as string;
const markerShadowUrl = (markerShadowPng as unknown) as string;

interface StateInfo {
  [key: string]: {
    value: number;
    info: string;
  };
}

// interface RawMarkerData {
//   Latitude: number;
//   Longitude: number;
//   "All Item Type": number;
//   "Date and Time:": string;
// }

interface RawMarkerData {
  Latitude: number;
  Longitude: number;
  "Litter Quantity": number;  // Sum of All Item Type (renamed)
  "Date and Time": string;
  City: string;  // First City
  "Site Area": string;  // First Site Area
  "Site Type": string;  // First Site Type
  "Roadway Type": string;  // First Roadway Type
  "Survey Type": string;  // First Survey Type
}

interface MapAnalysisProps {
  stateInfo: any;
  zoom: number;
  center: [number, number];
  showGeoJSON: boolean; // New boolean prop to toggle GeoJSON layer
  markers: RawMarkerData[];
}

// Function to style each state based on its data
const getStateStyle = (stateId: string, stateInfo: any) => {
  const stateData = stateInfo[stateId];
  const value = stateData ? stateData.value : 0;

  const color =
    value < 0.001 ? "#FFFFFF" :
    value < 0.2 ? "#00FF00" :
    value < 0.4 ? "#80FF00" :
    value < 0.6 ? "#FFFF00" :
    value < 0.8 ? "#FF8000" : "#FF0000";

  return {
    fillColor: color,
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  };
};

// Function to bind popups to each state
const onEachState = (state: any, layer: L.Layer, stateInfo: any) => {
  
  const stateId = state.properties.name;
  const stateData = stateInfo[stateId];
  console.log("came here",stateId,stateData)
  if (stateData) {
    layer.bindPopup(`
      State: ${stateData?.State}<br>
     Estimated litter quantity: ${stateData["Estimated Litter Quantity"]}<br>
     Estimated litter density: ${stateData["Estimated Litter Density"]}<br>
      Bottle bill status: ${stateData["Bottle Bill Status"]}
    `);
  }
};

const defaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [15, 25], // Small marker
  iconAnchor: [7, 25], // Bottom-center anchor
  popupAnchor: [0, -25], // Adjusts popup position
  shadowSize: [25, 25], // Ensures shadow aligns correctly
});

const MapAnalysisGEOJSON: React.FC<MapAnalysisProps> = React.memo(({ stateInfo, zoom, center, showGeoJSON, markers }) => {
  return (
    <div className="w-full h-full">
      <MapContainer center={center} zoom={zoom} style={{height: "420px", marginTop:'-21px' }} attributionControl={false} className="rounded-lg">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Conditionally render the GeoJSON layer */}
        {showGeoJSON && (
          <GeoJSON 
            data={usStatesGeoJSON} 
            style={(state: any) => getStateStyle(state.properties.name, stateInfo)} 
            onEachFeature={(feature, layer) => onEachState(feature, layer, stateInfo)} 
          />
        )}
        {markers?.map((marker, index) => (
  <Marker key={index} position={[marker.Latitude, marker.Longitude]}
  icon={defaultIcon}>
    <Popup>
      Latitude: {marker?.Latitude} <br />
      Longitude: {marker?.Longitude} <br />
      Litter quantity: {marker["Litter Quantity"]} <br />   
      City: {marker?.City} <br /> 
      Site Area: {marker["Site Area"]} <br /> 
      Site Type: {marker["Site Type"]} <br /> 
      Roadway Type: {marker["Roadway Type"]} <br />      
      Survey Type: {marker["Survey Type"]} <br />
    </Popup>
  </Marker>
))}

      </MapContainer>
    </div>
  );
});

// ✅ Assign a display name
MapAnalysisGEOJSON.displayName = "MapAnalysisGEOJSON";

export default MapAnalysisGEOJSON;
