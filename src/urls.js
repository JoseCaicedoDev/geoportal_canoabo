// Archivo centralizado de URLs para servicios y mapas

// Detectar si estamos en desarrollo o producción
const isDevelopment = import.meta.env.DEV;

// Configuración para preferir servidor remoto con fallback a datos locales
const PREFER_REMOTE_DATA = true; // true = intentar servidor primero, false = usar solo local

// URLs de datos locales (archivos GeoJSON en la carpeta data)
const LOCAL_DATA_BASE = import.meta.env.BASE_URL || '/';

// Configuración del servidor GeoServer (para cuando esté funcionando)
const GEOSERVER_HTTPS_URL = 'https://geoserver.gira360.com/geoserver';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const GEOSERVER_BASE = isDevelopment
  ? '/geoserver'
  : `${CORS_PROXY}${encodeURIComponent(GEOSERVER_HTTPS_URL)}`;

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

// URLs dinámicas: configuración para servidor remoto y fallback local
export const GEOSERVER_WMS_URL = `${GEOSERVER_BASE}/canoabo/wms`;

// Configuración de URLs para WFS con servidor remoto y fallback local
export const LAYER_CONFIGS = {
  'suelos': {
    remote: `${GEOSERVER_BASE}/canoabo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=canoabo%3Apg_Suelo8_ur&outputFormat=application%2Fjson&srsName=EPSG:4326`,
    local: `${LOCAL_DATA_BASE}data/pg_Suelo8_ur.json`
  },
  'rios': {
    remote: `${GEOSERVER_BASE}/canoabo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=canoabo%3Apg_rios_ur&outputFormat=application%2Fjson&srsName=EPSG:4326`,
    local: `${LOCAL_DATA_BASE}data/pg_rios_ur.json`
  },
  'perimetro': {
    remote: `${GEOSERVER_BASE}/canoabo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=canoabo%3Apg_perimetro&outputFormat=application%2Fjson&srsName=EPSG:4326`,
    local: `${LOCAL_DATA_BASE}data/pg_perimetro.json`
  },
  'embalse': {
    remote: `${GEOSERVER_BASE}/canoabo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=canoabo%3Apg_embalse_ur&outputFormat=application%2Fjson&srsName=EPSG:4326`,
    local: `${LOCAL_DATA_BASE}data/pg_embalse_ur.json`
  }
};

// URLs de compatibilidad (mantenidas para retrocompatibilidad)
export const GEOSERVER_WFS_SUELO_URL = PREFER_REMOTE_DATA
  ? LAYER_CONFIGS.suelos.remote
  : LAYER_CONFIGS.suelos.local;

export const GEOSERVER_WFS_RIOS_URL = PREFER_REMOTE_DATA
  ? LAYER_CONFIGS.rios.remote
  : LAYER_CONFIGS.rios.local;

export const GEOSERVER_WFS_PERIMETRO_URL = PREFER_REMOTE_DATA
  ? LAYER_CONFIGS.perimetro.remote
  : LAYER_CONFIGS.perimetro.local;

export const GEOSERVER_WFS_EMBALSE_URL = PREFER_REMOTE_DATA
  ? LAYER_CONFIGS.embalse.remote
  : LAYER_CONFIGS.embalse.local;

// Función para obtener configuración de capa con fallback
export const getLayerConfig = (layerKey) => {
  return LAYER_CONFIGS[layerKey] || null;
};

// Función para logging (útil para debugging en producción)
export const logGeoServerConfig = () => {
  console.log('🌍 GeoServer Config:', {
    isDevelopment,
    preferRemoteData: PREFER_REMOTE_DATA,
    baseUrl: GEOSERVER_BASE,
    localDataBase: LOCAL_DATA_BASE,
    dataStrategy: PREFER_REMOTE_DATA ? 'Remote with local fallback' : 'Local only',
    layerConfigs: LAYER_CONFIGS
  });
};
