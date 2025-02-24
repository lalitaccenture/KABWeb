declare module 'leaflet.heat' {
    import * as L from 'leaflet';
  
    // Extend the Leaflet module with the heatLayer method
    export function heatLayer(
      latLngs: [number, number, number][],  // Array of lat, lng, intensity
      options?: L.HeatLayerOptions
    ): L.Layer;
  }
  