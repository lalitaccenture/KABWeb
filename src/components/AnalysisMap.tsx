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
  date: string;
   radius:number
}


interface MapAnalysisProps {
  markers: MarkerData[]; 
  zoom: number;
  center: [number, number];
}

const MapAnalysis: React.FC<MapAnalysisProps> = ({ markers, zoom, center }) => {

  const router = useRouter();

  console.log("markers",markers)
//new Date(marker?.cleanup_date).toISOString().split('T')[0]
  return (
    <>



    <div className="w-full h-full mt-18">
    

      <MapContainer center={center} zoom={zoom} style={{ height: "420px", }} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers?.map((marker, index) =>  {
        const size = marker?.radius || 32;
        return (
          <Marker key={index} position={{ lat: marker.latitude, lng: marker.longitude }} 
          icon={L.divIcon({
            html: `<div 
            class="rounded-full flex justify-center items-center text-white text-xs font-bold" 
            style="width: ${size}px; height: ${size}px; background-color: rgba(128, 0, 128, 0.4);">
          </div>`
          ,
            className: "transparent-icon",
            iconSize: [size,size], // Size of the bubble
            
            iconAnchor: [16, 16], // Center the icon
          })}
          >
            <Popup>
     
<div>
              {/* Display relevant information about the marker    */}
            
              Litter Quantity Collected: {marker?.litter_quantity} <br />
              Cleanup Date: {marker?.date}
</div>
              </Popup>
          </Marker>
        )})}
      </MapContainer>
      <div className="mt-5 flex items-center gap-2" style={{marginTop:"1px" }}>


        <div className="w-3 h-3 rounded-full " style={{backgroundColor:'rgba(128, 0, 128, 0.4)'}}></div>
        <span className="text-gray-400 text-xs font-xs">Cleanup Site - Bubble size reflects the amount of litter collected; larger bubble indicates more litter</span>
      </div>
    </div>
  
    </>
    
  );
};

export default MapAnalysis;
