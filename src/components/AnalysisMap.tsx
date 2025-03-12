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
<div
  className="absolute top-0 left-1/2 transform -translate-x-1/2 flex gap-4"
  style={{ marginTop: '72px' }}
>

  <button className="w-[237px] h-[36px] text-white font-medium rounded-md bg-[#5BAA76]" onClick={()=>router.push("/analysis-external")}>
    Litter Cleanup Analysis
  </button>
  <button className="w-[237px] h-[36px] text-black font-medium border border-[#5BAA76] rounded-md bg-white" 
  onClick={() => router.push("/analysis-kab")}>
  Litter Survey Analysis
</button>

</div>


    <div className="w-full h-full mt-18">
    

      <MapContainer center={center} zoom={zoom} style={{ height: "420px", width: "715px" , marginLeft:'-3%' }} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers?.map((marker, index) =>  {
        const size = marker?.radius || 32;
        return (
          <Marker key={index} position={{ lat: marker.latitude, lng: marker.longitude }} 
          icon={L.divIcon({
            html: `<div class="rounded-full w-8 h-8 flex justify-center items-center text-white text-xs font-bold" 
    style="background-color: rgba(91, 170, 118, 0.1);"></div>`,
            className: "transparent-icon",
            iconSize: [size,size], // Size of the bubble
            
            iconAnchor: [16, 16], // Center the icon
          })}
          >
            <Popup>
     
<div className="bg-[#5BAA76]">
              {/* Display relevant information about the marker    */}
              Latitude: {marker?.latitude} <br />
              Longitude: {marker?.longitude} <br />
      Sum of Litter Quantity: {marker?.litter_quantity} <br />
      Latest Cleanup Date: {new Date(marker?.cleanup_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
})}
</div>
              </Popup>
          </Marker>
        )})}
      </MapContainer>
      <div className="mt-5 flex items-center gap-2" style={{ marginLeft: "-19px" , marginTop:"1px" }}>


        <div className="w-2 h-2 rounded-full bg-[#5BAA76]"></div>
        <span className="text-black text-sm font-medium">Cleanup Site</span>
      </div>
    </div>
  
    </>
    
  );
};

export default MapAnalysis;
