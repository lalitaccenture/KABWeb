"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface MarkerData {
  latitude: number;
  longitude: number;
  Litter_density: number;
  GEOID: string;
  Predicted_Qty:number;
  color: string;
  pie_chart:object
}

interface EventData {
  Impact: string; 
  "Event count": number;
  latitude: number;
  longitude: number;
  GEOID: string;
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
  switches: SwitchState;
  eventData: EventData[]
}

interface CanvasMarkersLayerProps {
  data: MarkerData[];
}

interface CanvasEventMarkersLayerProps {
  data: EventData[];
}

const CanvasMarkersLayer: React.FC<CanvasMarkersLayerProps> = ({ data }) => {
    const map = useMap();
    const canvasRenderer = L.canvas({ padding: 0.5 });
  
    data?.forEach((item) => {   
    const marker = L.circleMarker([item.latitude, item.longitude], {
        renderer: canvasRenderer, 
        radius: 5, 
        fillColor: "rgba(128, 0, 128, 0.4)",
        opacity: 1,
        fillOpacity: 0.4, 
        stroke: false,
      });

let tableContent = `
  <table style="width: 100%; text-align: left; margin: 20px 0; border-collapse: collapse; border: 1px solid black;">
    <thead>
      <tr>
        <th style="border: 1px solid black; padding: 8px;">Material</th>
        <th style="border: 1px solid black; padding: 8px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(item?.pie_chart).map(([material, amount], index) => `
        <tr key="${index}" style="border: 1px solid black;">
          <td style="border: 1px solid black; padding: 8px;">${material}</td>
          <td style="border: 1px solid black; padding: 8px;">${amount}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;
      
      marker.bindPopup(`
        GEO ID: ${item.GEOID}<br>
        Litter Density: ${item.Litter_density}<br>
        Predicted Quantity: ${item.Predicted_Qty}<br>
        ${tableContent}
      `);
      marker.addTo(map);
    
    });
  
    return null; // We are manually adding markers, so no need to render anything
  };

  const CanvasEventMarkersLayer: React.FC<CanvasEventMarkersLayerProps> = ({ data }) => {
    const map = useMap();
    const canvasRenderer = L.canvas({ padding: 0.5 });
  
    data?.forEach((item) => {   
    const marker = L.circleMarker([item.latitude, item.longitude], {
        renderer: canvasRenderer, 
        radius: 5, 
        fillColor: "rgba(0, 255, 0, 0.4)",
        opacity: 1,
        fillOpacity: 0.4, 
        stroke: false,
      });
//       let tableContent = `
//   <table border="1" style="width: 100%; text-align: left; margin: 20px 0;">
//     <thead>
//       <tr>
//         <th>Material</th>
//         <th>Amount</th>
//       </tr>
//     </thead>
//     <tbody>
//       ${Object.entries(item?.litter_quantity).map(([material, amount], index) => `
//         <tr key="${index}">
//           <td>${material}</td>
//           <td>${amount}</td>
//         </tr>
//       `).join('')}
//     </tbody>
//   </table>
// `;
      marker.bindPopup(`
        Event Count: ${item?.["Event count"]}<br>
        GEOID: ${item?.["GEOID"]}<br>
        Impact: ${item?.["Impact"]}`);
      marker.addTo(map);
    
    });
  
    return null; // We are manually adding markers, so no need to render anything
  };

const MapPrediction: React.FC<MapAnalysisProps> = ({ markers, zoom, center,switches,eventData }) => {

  const router = useRouter();

  console.log("markers",markers)
//new Date(marker?.cleanup_date).toISOString().split('T')[0]
  return (
    <>

    <div className="w-full h-full">
    

      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} attributionControl={false} className="rounded-lg">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CanvasMarkersLayer data={markers} />
        <CanvasEventMarkersLayer data={eventData} />
      </MapContainer>
    </div>
    </>
  );
};

export default MapPrediction;
