"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo } from "react";
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
  events: boolean;
  amenities:boolean
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
  canvasRenderer: L.Renderer;
}

interface CanvasEventMarkersLayerProps {
  data: EventData[];
  canvasRenderer: L.Renderer;
}

const CanvasMarkersLayer: React.FC<CanvasMarkersLayerProps> = React.memo(({ data, canvasRenderer }) => {
  const map = useMap();

  data?.forEach((item) => {   
    const marker = L.circleMarker([item.latitude, item.longitude], {
      renderer: canvasRenderer, // ✅ Use the shared renderer
      radius: 5,
      fillColor: "rgba(128, 0, 128, 0.4)",
      opacity: 1,
      fillOpacity: 0.4,
      stroke: false,
      interactive: true, // ✅ Ensure popups work
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

    marker.on("click", function () {
      marker.openPopup();
    });

    marker.addTo(map);
  });

  return null;
});


CanvasMarkersLayer.displayName = "CanvasMarkersLayer";

const CanvasEventMarkersLayer: React.FC<CanvasEventMarkersLayerProps> = ({ data, canvasRenderer }) => {
  const map = useMap();

  useEffect(() => {
    const markers: L.CircleMarker[] = [];

    data?.forEach((item) => {   
      const marker = L.circleMarker([item.latitude, item.longitude], {
        renderer: canvasRenderer,
        radius: 5,
        fillColor: "rgba(0, 255, 0, 0.4)",
        opacity: 1,
        fillOpacity: 0.4,
        stroke: false,
        interactive: true,
      });

      marker.bindPopup(
        `Event Count: ${item?.["Event count"]}<br>
        GEOID: ${item?.["GEOID"]}<br>
        Impact: ${item?.["Impact"]}`
      );

      marker.on("click", () => marker.openPopup());

      marker.addTo(map);
      markers.push(marker);
    });

    // Cleanup function to remove markers when component unmounts
    return () => {
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [data, map, canvasRenderer]); // Re-run effect if data changes

  return null;
};


const MapPrediction: React.FC<MapAnalysisProps> = React.memo(({ markers, zoom, center,switches,eventData }) => {

  const router = useRouter();
  const canvasRenderer = useMemo(() => L.canvas({ padding: 0.5 }), []);
  console.log("markers",markers,switches)
//new Date(marker?.cleanup_date).toISOString().split('T')[0]
  return (
    <>

    <div className="w-full h-full">
    

      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} attributionControl={false} className="rounded-lg">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CanvasMarkersLayer data={markers} canvasRenderer={canvasRenderer}/>
        {switches?.events &&
        <CanvasEventMarkersLayer data={eventData} canvasRenderer={canvasRenderer}/>
}
      </MapContainer>
    </div>
    </>
  );
});


MapPrediction.displayName = "MapPrediction";

export default MapPrediction;
