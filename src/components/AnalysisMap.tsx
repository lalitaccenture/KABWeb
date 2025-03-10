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
<div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-[95px] flex gap-4">
  <button className="w-[237px] h-[36px] text-white font-medium rounded-md bg-[#5BAA76]" onClick={()=>router.push("/analysis-external")}>
    Litter Cleanup Analysis
  </button>
  <button className="w-[237px] h-[36px] text-black font-medium border border-[#5BAA76] rounded-md bg-white" 
  onClick={() => router.push("/analysis-kab")}>
  Litter Survey Analysis
</button>

</div>


    <div className="w-full h-full mt-12">
    

      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers?.map((marker, index) => (
          <Marker key={index} position={{ lat: marker.latitude, lng: marker.longitude }} 
          icon={L.divIcon({
            html: `<div class="bg-blue-700 rounded-full w-8 h-8 flex justify-center items-center text-white text-xs font-bold"></div>`,
            iconSize: [36, 36], // Size of the bubble
            
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
      <div className="mt-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#5BAA76]"></div>
        <span className="text-black text-sm font-medium">Cleanup Site</span>
      </div>
    </div>
  
    </>
    
  );
};

export default MapAnalysis;
