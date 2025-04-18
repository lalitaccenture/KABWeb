"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';

interface MarkerData {
  latitude: number;
  longitude: number;
  Litter_density: number;
  GEOID: string;
  Predicted_Qty:number;
  colorType: string;
  pie_chart:object
}

interface EventData {
  Impact: string; 
  "Event count": number;
  latitude: number;
  longitude: number;
  GEOID: string;
}

interface BinData {
  latitude: number;
  longitude: number;
}

interface AmenitiesData extends BinData {
  type: string;
}


interface SwitchState {
  bins: boolean;
  events: boolean;
  amenities:boolean,
  transit : boolean,
  entertainment : boolean,
  education: boolean,
  retail: boolean
}


interface MapAnalysisProps {
  markers: MarkerData[]; 
  zoom: number;
  center: [number, number];
  switches: SwitchState;
  eventData: EventData[];
  binData: any;
  amenitiesData: any;
  amenitiesRetail: any;
  amenitiesEntertainment:any;
  amenitiesTransit:any;
  amenitiesEducation:any;
}

interface CanvasMarkersLayerProps {
  data: MarkerData[];
  canvasRenderer: L.Renderer;
}

interface CanvasEventMarkersLayerProps {
  data: EventData[];
  canvasRenderer: L.Renderer;
}

interface CanvasBinMarkersLayerProps {
  data: BinData[];
  canvasRenderer: L.Renderer;
}

interface CanvasAmenitiesMarkersLayerProps {
  data: AmenitiesData[];
  canvasRenderer: L.Renderer;
}

const CanvasMarkersLayer: React.FC<CanvasMarkersLayerProps> = React.memo(({ data, canvasRenderer }) => {
  const map = useMap();

  data?.forEach((item) => {  
    const color = item?.colorType || "#800080"; 
    const marker = L.circleMarker([item.latitude, item.longitude], {
      renderer: canvasRenderer, // ✅ Use the shared renderer
      radius: 5,
      fillColor: color,
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
        <th style="border: 1px solid black; padding: 8px;">% Breakup</th>
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
// ${Object.entries(item?.pie_chart).map(([material, amount], index) =>
//   `${material} : ${Math.floor(amount*100)}%`
// ).join('')}
    marker.bindPopup(`
      <strong>GEO ID:</strong> ${item.GEOID}<br>
      <strong>Litter Density:</strong> ${item.Litter_density}<br>
      <strong>Predicted Quantity:</strong> ${item.Predicted_Qty}<br>
      <strong>Material Breakdown:</strong> <br>
      
      ${
        Object.entries(item?.pie_chart)
          .reduce((acc:any, [material, amount], index) => {
            const formatted = `<span style="display:inline-block; margin-right:10px;">${material}: ${Math.floor(amount * 100)}%</span>`;
            if (index % 3 === 0) acc.push([]); // start a new line every 4 items
            acc[acc.length - 1].push(formatted);
            return acc;
          }, [])
          //@ts-ignore: Ignore TypeScript error
          .map(group => group.join(' '))
          .join('<br>')
      }
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
        fillColor: "rgba(0, 255, 0, 0.7)",
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

const CanvasBinMarkersLayer: React.FC<CanvasBinMarkersLayerProps> = ({ data, canvasRenderer }) => {
  const map = useMap();

  useEffect(() => {
    const markers: L.CircleMarker[] = [];

    data?.forEach((item) => {   
      const marker = L.circleMarker([item.latitude, item.longitude], {
        renderer: canvasRenderer,
        radius: 5,
        fillColor: "rgba(252, 15, 192,0.7)",
        opacity: 1,
        fillOpacity: 0.4,
        stroke: false,
        interactive: true,
      });

      

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


// const CanvasAmenitiesMarkersLayer: React.FC<CanvasAmenitiesMarkersLayerProps> = ({ data, canvasRenderer }) => {
//   const map = useMap();

//   useEffect(() => {
//     const markers: L.Layer[] = [];

//     data?.forEach((item) => {
//       const lat = item.latitude;
//       const lng = item.longitude;

//       if (typeof lat !== 'number' || typeof lng !== 'number') return;

//       // Triangle size in degrees (adjust if needed)
//       const size = 0.002;

//       // Create triangle coordinates
//       const triangleCoords: [number, number][] = [
//         [lat + size, lng],              // Top point
//         [lat - size, lng - size],       // Bottom-left
//         [lat - size, lng + size],       // Bottom-right
//       ];

//       const triangle = L.polygon(triangleCoords, {
//         renderer: canvasRenderer,
//         fillColor: "rgba(0, 0, 255, 0.7)",
//         fillOpacity: 0.4,
//         stroke: false,
//         interactive: true,
//       });

//       triangle.bindPopup(`Type: ${item?.type}`);
//       triangle.on("click", () => triangle.openPopup());

//       triangle.addTo(map);
//       markers.push(triangle);
//     });

//     return () => {
//       markers.forEach(marker => map.removeLayer(marker));
//     };
//   }, [data, map, canvasRenderer]);

//   return null;
// };

const CanvasAmenitiesMarkersLayerTriangle: React.FC<CanvasAmenitiesMarkersLayerProps> = ({ data, canvasRenderer }) => {
  const map = useMap();

  useEffect(() => {
    const markers: L.Polygon[] = [];

    const getTriangleCoords = (lat: number, lng: number, size: number): [number, number][] => {
      return [
        [lat + size, lng],          // top
        [lat - size, lng - size],   // bottom-left
        [lat - size, lng + size],   // bottom-right
      ];
    };

    const drawTriangles = () => {
      markers.forEach(marker => map.removeLayer(marker));
      markers.length = 0;

      const zoom = map.getZoom();
      let size = 0.005; // default

      // Adjust size based on zoom level manually
      if (zoom >= 15) size = 0.0005;
      else if (zoom >= 13) size = 0.001;
      else if (zoom >= 11) size = 0.002;
      else size = 0.005;

      data?.forEach((item) => {
        const lat = item.latitude;
        const lng = item.longitude;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        const triangleCoords = getTriangleCoords(lat, lng, size);

        const triangle = L.polygon(triangleCoords, {
          renderer: canvasRenderer,
          fillColor: "rgba(0, 0, 255, 1)",
          fillOpacity: 0.4,
          stroke: false,
          interactive: true,
        });

        triangle.bindPopup(`Type: ${item?.type}`);
        triangle.on("click", () => triangle.openPopup());

        triangle.addTo(map);
        markers.push(triangle);
      });
    };

    // Initial draw
    drawTriangles();

    // Redraw on zoom
    map.on('zoomend', drawTriangles);

    return () => {
      map.off('zoomend', drawTriangles);
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [data, map, canvasRenderer]);

  return null;
};


const calendarIcon = L.divIcon({
  html: `<div class="text-[16px] w-[20px] h-[20px] text-center leading-[20px]">📅</div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20],
});

const svgCalendarIcon = L.divIcon({
  html: `
    <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2V5" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 2V5" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 9H21" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 9V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V9C3 7.9 3.9 7 5 7H19C20.1 7 21 7.9 21 9Z"
              stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const getImpactIcon = (impact: string) => {
  let iconUrl = "/Low.svg"; 

  if (impact === "Medium") {
    iconUrl = "/Medium.svg";
  } else if (impact === "High") {
    iconUrl = "/High.svg";
  }

  return L.icon({
    iconUrl,
    iconSize: [3, 20],        // width x height
  iconAnchor: [1.5, 20],       // center horizontally (10/2), bottom vertically
  popupAnchor: [0, -20],
  });
};

const binssvgFileIcon = L.icon({
  iconUrl: "/bins.svg", // relative or absolute path
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20],
});


const CustomIconMarkerForEvents = ({markers}:any)=>{
  console.log("test",markers)
  return(
    <>
      {markers?.map((marker:any, index:any) => (
      <Marker key={index} position={[marker.latitude, marker.longitude]}
      icon={getImpactIcon(marker?.["Impact"])}>
        <Popup>
          Event Count: {marker?.["Event count"]}<br/>
        GEOID: {marker?.["GEOID"]}<br/>
        Impact: {marker?.["Impact"]}
        </Popup>
      </Marker>
    ))}
    </>
  )
}

const CustomIconMarkerForBins = ({markers}:any)=>{
  console.log("test",markers)
  return(
    <>
      {markers?.map((marker:any, index:any) => (
      <Marker key={index} position={[marker.latitude, marker.longitude]}
      icon={binssvgFileIcon}>
      </Marker>
    ))}
    </>
  )
}

const CustomIconMarkerForBinsWithZoom = ({ markers }: any) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const handleZoom = () => {
      setZoom(map.getZoom());
    };

    map.on("zoomend", handleZoom);
    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map]);

  // Function to get icon based on zoom level
  const getBinIcon = (zoomLevel: number) =>
    L.icon({
      iconUrl: "/bins.svg",
      iconSize: [zoomLevel * 2.5, zoomLevel * 2.5], // Adjust scale as needed
      iconAnchor: [zoomLevel * 1.25, zoomLevel * 2.5],
      popupAnchor: [0, -zoomLevel * 2],
    });

  return (
    <>
      {markers?.map((marker: any, index: number) => (
        <Marker
          key={index}
          position={[marker.latitude, marker.longitude]}
          icon={getBinIcon(zoom)}
        />
      ))}
    </>
  );
};

const CanvasAmenitiesMarkersLayerStar: React.FC<CanvasAmenitiesMarkersLayerProps> = ({ data, canvasRenderer }) => {
  const map = useMap();

  useEffect(() => {
    const markers: L.Polygon[] = [];

    const toRadians = (deg: number) => (deg * Math.PI) / 180;

    const getStarCoords = (
      lat: number,
      lng: number,
      outerRadius: number,
      innerRadius: number,
      points = 5
    ): [number, number][] => {
      const coords: [number, number][] = [];
      const angleStep = 360 / (points * 2);

      for (let i = 0; i < points * 2; i++) {
        const angleDeg = i * angleStep - 90; // rotate so top point is up
        const angleRad = toRadians(angleDeg);
        const radius = i % 2 === 0 ? outerRadius : innerRadius;

        const dx = Math.cos(angleRad) * radius;
        const dy = Math.sin(angleRad) * radius;

        coords.push([lat + dy, lng + dx]);
      }

      return coords;
    };

    const drawStars = () => {
      markers.forEach(marker => map.removeLayer(marker));
      markers.length = 0;

      const zoom = map.getZoom();
      let outerRadius = 0.0015;
let innerRadius = 0.00075;

if (zoom >= 15) {
  outerRadius = 0.0007;
  innerRadius = 0.00035;
} else if (zoom >= 13) {
  outerRadius = 0.001;
  innerRadius = 0.0005;
}

      data?.forEach((item) => {
        const lat = item.latitude;
        const lng = item.longitude;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        const starCoords = getStarCoords(lat, lng, outerRadius, innerRadius);

        const star = L.polygon(starCoords, {
          renderer: canvasRenderer,
          fillColor: "rgba(0, 0, 255, 1)", // gold-like color
          fillOpacity: 0.6,
          stroke: false,
          interactive: true,
        });

        star.bindPopup(`Type: ${item?.type}`);
        star.on("click", () => star.openPopup());

        star.addTo(map);
        markers.push(star);
      });
    };

    drawStars();
    map.on('zoomend', drawStars);

    return () => {
      map.off('zoomend', drawStars);
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [data, map, canvasRenderer]);

  return null;
};

const CanvasAmenitiesMarkersLayerDiamond: React.FC<CanvasAmenitiesMarkersLayerProps> = ({ data, canvasRenderer }) => {
  const map = useMap();

  useEffect(() => {
    const markers: L.Polygon[] = [];

    const getDiamondCoords = (lat: number, lng: number, size: number): [number, number][] => {
      return [
        [lat + size, lng],        // top
        [lat, lng + size],        // right
        [lat - size, lng],        // bottom
        [lat, lng - size],        // left
      ];
    };

    const drawDiamonds = () => {
      markers.forEach(marker => map.removeLayer(marker));
      markers.length = 0;

      const zoom = map.getZoom();
      let size = 0.0015;

      if (zoom >= 15) {
        size = 0.0007;
      } else if (zoom >= 13) {
        size = 0.001;
      }

      data?.forEach((item) => {
        const lat = item.latitude;
        const lng = item.longitude;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        const coords = getDiamondCoords(lat, lng, size);

        const diamond = L.polygon(coords, {
          renderer: canvasRenderer,
          fillColor: "rgba(0, 128, 255, 1)", // bluish
          fillOpacity: 0.5,
          stroke: false,
          interactive: true,
        });

        diamond.bindPopup(`Type: ${item?.type}`);
        diamond.on("click", () => diamond.openPopup());

        diamond.addTo(map);
        markers.push(diamond);
      });
    };

    drawDiamonds();
    map.on('zoomend', drawDiamonds);

    return () => {
      map.off('zoomend', drawDiamonds);
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [data, map, canvasRenderer]);

  return null;
};


const CanvasAmenitiesMarkersLayer: React.FC<CanvasAmenitiesMarkersLayerProps> = ({ data, canvasRenderer }) => {
  const map = useMap();

  useEffect(() => {
    const markers: L.Polygon[] = [];

    const toRadians = (deg: number) => (deg * Math.PI) / 180;

    const getTriangleCoords = (lat: number, lng: number, size: number): [number, number][] => {
      return [
        [lat + size, lng],
        [lat - size, lng - size],
        [lat - size, lng + size],
      ];
    };

    const getDiamondCoords = (lat: number, lng: number, size: number): [number, number][] => {
      return [
        [lat + size, lng],
        [lat, lng + size],
        [lat - size, lng],
        [lat, lng - size],
      ];
    };

    const getStarCoords = (
      lat: number,
      lng: number,
      outerRadius: number,
      innerRadius: number,
      points = 5
    ): [number, number][] => {
      const coords: [number, number][] = [];
      const angleStep = 360 / (points * 2);

      for (let i = 0; i < points * 2; i++) {
        const angleDeg = i * angleStep - 90;
        const angleRad = toRadians(angleDeg);
        const radius = i % 2 === 0 ? outerRadius : innerRadius;

        const dx = Math.cos(angleRad) * radius;
        const dy = Math.sin(angleRad) * radius;

        coords.push([lat + dy, lng + dx]);
      }

      return coords;
    };

    const getHexagonCoords = (lat: number, lng: number, radius: number): [number, number][] => {
      const coords: [number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i; // 60 degrees
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        coords.push([lat + dy, lng + dx]);
      }
      return coords;
    };

    const getSquareCoords = (lat: number, lng: number, size: number): [number, number][] => {
      return [
        [lat + size, lng - size],
        [lat + size, lng + size],
        [lat - size, lng + size],
        [lat - size, lng - size],
      ];
    };

    const getPentagonCoords = (lat: number, lng: number, radius: number): [number, number][] => {
      const coords: [number, number][] = [];
      for (let i = 0; i < 5; i++) {
        const angle = (2 * Math.PI * i) / 5 - Math.PI / 2; // Rotate so the flat side is up
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        coords.push([lat + dy, lng + dx]);
      }
      return coords;
    };

    const drawShapes = () => {
      markers.forEach(marker => map.removeLayer(marker));
      markers.length = 0;

      const zoom = map.getZoom();

      let size = 0.0015;
      if (zoom >= 15) size = 0.0007;
      else if (zoom >= 13) size = 0.001;

      data?.forEach((item) => {
        const lat = item.latitude;
        const lng = item.longitude;
        const type = item.type;

        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        let coords: [number, number][] = [];
        let fillColor = 'rgba(0,0,0,0.6)';

        // Choose shape + color based on type
        switch (type) {
          case 'restaurant':
            coords = getDiamondCoords(lat, lng, size);
            fillColor = 'rgba(0, 128, 255, 0.7)';
            break;
          case 'Railway Station':
            coords = getStarCoords(lat, lng, size, size / 2);
            fillColor = 'rgba(255, 0, 0, 0.7)';
            break;
          case 'Bus Stop':
            coords = getTriangleCoords(lat, lng, size);
            fillColor = 'rgba(0, 0, 255, 0.7)';
            break;
          case 'park':
            coords = getHexagonCoords(lat, lng, size);
            fillColor = 'rgba(255, 165, 0, 0.7)';
            break;
          case 'school':
            coords = getSquareCoords(lat, lng, size);
            fillColor = 'rgba(128, 0, 255, 0.7)';
            break;
          default:
            coords = getPentagonCoords(lat, lng, size);
            fillColor = 'rgba(128, 128, 128, 0.6)';
        }

        const shape = L.polygon(coords, {
          renderer: canvasRenderer,
          fillColor,
          fillOpacity: 0.5,
          stroke: false,
          interactive: true,
        });

        shape.bindPopup(`Type: ${type}`);
        shape.on('click', () => shape.openPopup());

        shape.addTo(map);
        markers.push(shape);
      });
    };

    drawShapes();
    map.on('zoomend', drawShapes);

    return () => {
      map.off('zoomend', drawShapes);
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [data, map, canvasRenderer]);

  return null;
};

const CanvasAmenitiesMarkersLayerHexagon: React.FC<CanvasAmenitiesMarkersLayerProps> = ({ data, canvasRenderer }) => {
  const map = useMap();

  useEffect(() => {
    const markers: L.Polygon[] = [];

    const toRadians = (deg: number) => (deg * Math.PI) / 180;

    const getHexagonCoords = (
      lat: number,
      lng: number,
      radius: number
    ): [number, number][] => {
      const coords: [number, number][] = [];

      for (let i = 0; i < 6; i++) {
        const angleDeg = 60 * i - 30; // Pointy top orientation
        const angleRad = toRadians(angleDeg);

        const dx = Math.cos(angleRad) * radius;
        const dy = Math.sin(angleRad) * radius;

        coords.push([lat + dy, lng + dx]);
      }

      // Close the polygon by repeating the first point
      coords.push(coords[0]);

      return coords;
    };

    const drawHexagons = () => {
      markers.forEach(marker => map.removeLayer(marker));
      markers.length = 0;

      const zoom = map.getZoom();
      let radius = 0.001;

      if (zoom >= 15) {
        radius = 0.0005;
      } else if (zoom >= 13) {
        radius = 0.00075;
      }

      data?.forEach((item) => {
        const lat = item.latitude;
        const lng = item.longitude;
        if (typeof lat !== "number" || typeof lng !== "number") return;

        const hexCoords = getHexagonCoords(lat, lng, radius);

        const hex = L.polygon(hexCoords, {
          renderer: canvasRenderer,
          fillColor: "rgba(255,0,255,1)",
          fillOpacity: 0.6,
          stroke: false,
          interactive: true,
        });

        hex.bindPopup(`Type: ${item?.type}`);
        hex.on("click", () => hex.openPopup());

        hex.addTo(map);
        markers.push(hex);
      });
    };

    drawHexagons();
    map.on("zoomend", drawHexagons);

    return () => {
      map.off("zoomend", drawHexagons);
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [data, map, canvasRenderer]);

  return null;
};



const MapPrediction: React.FC<MapAnalysisProps> = React.memo(({ markers, zoom, center,switches,eventData,binData,amenitiesData, amenitiesRetail, amenitiesEntertainment, amenitiesEducation, amenitiesTransit }) => {

  const router = useRouter();
  const canvasRenderer = useMemo(() => L.canvas({ padding: 0.5 }), []);
  console.log("markers",binData,amenitiesData)

  useEffect(() => {
    if (switches?.retail) {
      if (!amenitiesRetail || amenitiesRetail.length === 0) {
        toast.error("No retail amenities found!");
      }
    }
  }, [switches?.retail]);
  
  useEffect(() => {
    if (switches?.transit) {
      if (!amenitiesTransit || amenitiesTransit.length === 0) {
        toast.error("No transit amenities found!");
      }
    }
  }, [switches?.transit]);
  
  useEffect(() => {
    if (switches?.education) {
      if (!amenitiesEducation || amenitiesEducation.length === 0) {
        toast.error("No education amenities found!");
      }
    }
  }, [switches?.education]);
  
  useEffect(() => {
    if (switches?.entertainment) {
      if (!amenitiesEntertainment || amenitiesEntertainment.length === 0) {
        toast.error("No entertainment amenities found!");
      }
    }
  }, [switches?.entertainment]);
  
  return (
    <>

    <div className="w-full h-full">
    

      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} attributionControl={false} className="rounded-lg">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CanvasMarkersLayer data={markers} canvasRenderer={canvasRenderer}/>
        {switches?.events && eventData?.length>0 &&
        // <CanvasEventMarkersLayer data={eventData} canvasRenderer={canvasRenderer}/>
        <CustomIconMarkerForEvents markers={eventData}/>
}
{switches?.bins && binData?.length>0 &&
        // <CanvasBinMarkersLayer data={binData} canvasRenderer={canvasRenderer}/>
        <CustomIconMarkerForBinsWithZoom markers={binData} />
}
{/* {switches?.amenities && amenitiesData?.length>0 &&
        <CanvasAmenitiesMarkersLayer data={amenitiesData} canvasRenderer={canvasRenderer}/>
} */}
{switches?.retail && amenitiesRetail?.length > 0 &&
  <CanvasAmenitiesMarkersLayerDiamond data={amenitiesRetail} canvasRenderer={canvasRenderer} />
}
{switches?.transit && amenitiesTransit?.length > 0 &&
<CanvasAmenitiesMarkersLayerStar data={amenitiesTransit} canvasRenderer={canvasRenderer}/>}
{switches?.education && amenitiesEducation?.length > 0 &&
<CanvasAmenitiesMarkersLayerTriangle data={amenitiesEducation} canvasRenderer={canvasRenderer}/>}
{switches?.entertainment && amenitiesEntertainment?.length > 0 &&
<CanvasAmenitiesMarkersLayerHexagon data={amenitiesEntertainment} canvasRenderer={canvasRenderer}/>}

      </MapContainer>
    </div>
    </>
  );
});


MapPrediction.displayName = "MapPrediction";

export default MapPrediction;
