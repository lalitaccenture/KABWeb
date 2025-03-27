"use client";

import { MapContainer, TileLayer, useMap  } from "react-leaflet";
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

interface CanvasMarkersLayerProps {
    data: MarkerData[];
  }

const CanvasMarkersLayer: React.FC<CanvasMarkersLayerProps> = ({ data }) => {
    const map = useMap();
    const canvasRenderer = L.canvas({ padding: 0.5 });
  
    data.forEach((item) => {   
    const marker = L.circleMarker([item.latitude, item.longitude], {
        renderer: canvasRenderer, 
        radius: item.radius / 2, 
        fillColor: "rgba(128, 0, 128, 0.4)",
        opacity: 1,
        fillOpacity: 0.4, 
        stroke: false,
      });
      marker.bindPopup(`Litter Quantity Collected: ${item.litter_quantity}<br>Cleanup Date: ${item.date}`);
      marker.addTo(map);
    });
  
    return null; // We are manually adding markers, so no need to render anything
  };

const AnalysisMap: React.FC<MapAnalysisProps> = ({ markers, zoom, center }) => {

  const router = useRouter();

  console.log("markers",markers)
//new Date(marker?.cleanup_date).toISOString().split('T')[0]
  return (
    <>
<div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex gap-4"   style={{ marginTop: '72px' }}>
  <button className="w-[237px] h-[36px] text-white font-medium rounded-md bg-[#5BAA76]" onClick={()=>router.push("/analysis-external")}>
    Litter Cleanup Analysis
  </button>
  <button className="w-[237px] h-[36px] text-black font-medium border border-[#5BAA76] rounded-md bg-white" 
  onClick={() => router.push("/analysis-kab")}>
  Litter Survey Analysis
</button>

</div>


    <div className="w-full h-full mt-18">
    

      <MapContainer center={center} zoom={zoom} style={{ height: "420px", }} attributionControl={false} className="rounded-lg">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CanvasMarkersLayer data={markers} />
      </MapContainer>
      <div className="mt-5 flex items-center gap-2" style={{marginTop:"1px" }}>


        <div className="w-3 h-3 rounded-full " style={{backgroundColor:'rgba(128, 0, 128, 0.4)'}}></div>
        <span className="text-gray-400 text-xs font-xs">Cleanup Site - Bubble size reflects the amount of litter collected; more litter means a larger bubble.</span>
      </div>
    </div>
  
    </>
    
  );
};

export default AnalysisMap;
