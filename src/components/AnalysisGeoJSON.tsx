"use client";

import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FeatureCollection } from "geojson";

// Import and typecast GeoJSON data
import usStatesGeoJSONRaw from "../../public/us-states.json";
const usStatesGeoJSON: FeatureCollection = usStatesGeoJSONRaw as FeatureCollection;

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
  stateInfo: StateInfo;
  zoom: number;
  center: [number, number];
  showGeoJSON: boolean; // New boolean prop to toggle GeoJSON layer
  markers: RawMarkerData[];
}

// Function to style each state based on its data
const getStateStyle = (stateId: string, stateInfo: StateInfo) => {
  const stateData = stateInfo[stateId];
  const value = stateData ? stateData.value : 0;

  const color =
    value < 0.2 ? "#f7fbff" :
    value < 0.4 ? "#deebf7" :
    value < 0.6 ? "#c6dbef" :
    value < 0.8 ? "#9ecae1" : "#3182bd";

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
const onEachState = (state: any, layer: L.Layer, stateInfo: StateInfo) => {
  const stateId = state.properties.name;
  const stateData = stateInfo[stateId];

  if (stateData) {
    layer.bindPopup(`
      <strong>${stateId}</strong><br>
      Value: ${stateData.value}<br>
      Info: ${stateData.info}
    `);
  }
};

const MapAnalysisGEOJSON: React.FC<MapAnalysisProps> = ({ stateInfo, zoom, center, showGeoJSON, markers }) => {
  return (
    <div className="w-full h-full">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} attributionControl={false}>
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
                  <Marker key={index} position={{ lat: marker.Latitude, lng: marker.Longitude }} 
                  icon={L.divIcon({
                    html: `<div class="bg-blue-500 rounded-full w-8 h-8 flex justify-center items-center text-white text-xs font-bold"></div>`,
                    iconSize: [32, 32], // Size of the bubble
                    iconAnchor: [16, 16], // Center the icon
                  })}
                  >
                    <Popup>
                    Latitude: {marker?.Latitude} <br />
                    Longitude: {marker?.Longitude} <br />
                    Sum of All Item Type: {marker["Litter Quantity"]} <br />   
                    First City: {marker?.City} <br /> 
                    First Site Area: {marker["Site Area"]} <br /> 
                    First Site Type: {marker["Site Type"]} <br /> 
                    First Roadway Type: {marker["Roadway Type"]} <br />      
              First Survey Type: {marker["Survey Type"]} <br />
                      </Popup>
                  </Marker>
                ))}
      </MapContainer>
    </div>
  );
};

export default MapAnalysisGEOJSON;
