"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface MarkerData {
  latitude: number;
  longitude: number;
  litter_quantity: number;
  cleanup_date: string;
}

interface SwitchState {
    bins: boolean;
    socioEconomic: boolean;
    weatherOutlook: boolean;
    typeOfArea: boolean;
  }


interface MapAnalysisProps {
  markers: MarkerData[]; 
  zoom: number;
  center: [number, number];
  switches: SwitchState
}

const MapPrediction: React.FC<MapAnalysisProps> = ({ markers, zoom, center,switches }) => {

  const router = useRouter();

  console.log("markers",markers)
//new Date(marker?.cleanup_date).toISOString().split('T')[0]
  return (
    <>

    <div className="w-full h-full">
    

      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers?.map((marker, index) => (
          <Marker key={index} position={{ lat: marker.latitude, lng: marker.longitude }} 
          icon={L.divIcon({
            html: `<div class="bg-blue-700 rounded-full w-8 h-8 flex justify-center items-center text-white text-xs font-bold"></div>`,
            iconSize: [32, 32], // Size of the bubble
            iconAnchor: [16, 16], // Center the icon
          })}
          >
            <Popup>
              {/* Display relevant information about the marker */}
              Latitude: {marker?.latitude} <br />
              Longitude: {marker?.longitude} <br />
      Sum of Litter Quantity: {marker?.litter_quantity} <br />
      Latest Cleanup Date: {new Date(marker?.cleanup_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
})}
              </Popup>
          </Marker>
        ))}

        {switches?.bins && markers?.map((marker, index) => (
          <Marker key={index} position={{ lat: marker.latitude, lng: marker.longitude }} 
          icon={L.divIcon({
            html: `<div class="bg-blue-700 rounded-full w-8 h-8 flex justify-center items-center text-white text-xs font-bold"></div>`,
            iconSize: [32, 32], // Size of the bubble
            iconAnchor: [16, 16], // Center the icon
          })}
          >
            <Popup>
              {/* Display relevant information about the marker */}
              Latitude: {marker?.latitude} <br />
              Longitude: {marker?.longitude} <br />
      Sum of Litter Quantity: {marker?.litter_quantity} <br />
      Latest Cleanup Date: {new Date(marker?.cleanup_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
})}
              </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
    </>
  );
};

export default MapPrediction;
