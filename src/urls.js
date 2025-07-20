// Archivo centralizado de URLs para servicios y mapas

// Detectar si estamos en desarrollo o producción
const isDevelopment = import.meta.env.DEV;

// Configuración del servidor GeoServer (HTTPS)
const GEOSERVER_HTTPS_URL = 'https://geoserver.gira360.com/geoserver';

const GEOSERVER_BASE = isDevelopment 
  ? '/geoserver' // En desarrollo, usar proxy de Vite
  : GEOSERVER_HTTPS_URL; // En producción, usar directamente HTTPS (sin proxy necesario)

// URLs de mapas base
export const ESRI_WORLD_IMAGERY_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
export const ESRI_WORLD_STREET_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
export const ESRI_WORLD_TOPO_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
export const ESRI_WORLD_GRAYSCALE_URL = 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OPENTOPOMAP_URL = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';

// Atribuciones de mapas base
export const ESRI_IMAGERY_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
export const ESRI_STREET_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom';
export const ESRI_TOPO_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community';
export const ESRI_GRAYSCALE_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const OPENTOPOMAP_ATTRIBUTION = '&copy; OpenTopoMap contributors';

// URLs WMS y WFS de GeoServer (dinámicas según entorno)
export const GEOSERVER_WMS_URL = `${GEOSERVER_BASE}/canoabo/wms`;
export const GEOSERVER_WFS_SUELO_URL = `${GEOSERVER_BASE}/canoabo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=canoabo%3Apg_Suelo8_ur&outputFormat=application%2Fjson&srsName=EPSG:4326`;
export const GEOSERVER_WFS_RIOS_URL = `${GEOSERVER_BASE}/canoabo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=canoabo%3Apg_rios_ur&outputFormat=application%2Fjson&srsName=EPSG:4326`;
export const GEOSERVER_WFS_PERIMETRO_URL = `${GEOSERVER_BASE}/canoabo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=canoabo%3Apg_perimetro&outputFormat=application%2Fjson&srsName=EPSG:4326`;
export const GEOSERVER_WFS_EMBALSE_URL = `${GEOSERVER_BASE}/canoabo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=canoabo%3Apg_embalse_ur&outputFormat=application%2Fjson&srsName=EPSG:4326`;

// Función para obtener URL completa del geoserver (útil para debugging)
export const getGeoServerBaseUrl = () => GEOSERVER_BASE;

// Función para logging (útil para debugging en producción)
export const logGeoServerConfig = () => {
  console.log('🌍 GeoServer Config:', {
    isDevelopment,
    baseUrl: GEOSERVER_BASE,
    protocol: 'HTTPS (direct connection)'
  });
};
