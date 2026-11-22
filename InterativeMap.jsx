import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Compass,
  ExternalLink,
  Layers,
  Loader2,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

const BRAZIL_CENTER = [-14.235, -51.9253];
const INITIAL_ZOOM = 4;
const COMMUNITY_URL = 'https://parquesnacionaisinterculturais.ning.com/';

const REGIONS = ['TODAS', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

const TILE_LAYERS = {
  street: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, TomTom, Garmin, FAO, NOAA, USGS',
    subdomains: 'abc',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    subdomains: 'abc',
  },
};

// CDNs oficiais do Leaflet e do plugin MarkerCluster (evita erros de bundle no Preview)
const LEAFLET_ASSETS = {
  css: [
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
  ],
  leafletJs: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  clusterJs:
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
};

/**
 * Conjunto inicial de Parques Nacionais do Brasil usado como fallback no Preview
 * caso a prop `parques` não seja informada pelo componente pai.
 */
const DEFAULT_PARQUES = [
  { id: 1, nome: 'Parque Nacional do Jaú', uf: 'AM', regiao: 'Norte', lat: -1.9, lng: -62.6, hectares: '2.367.333 ha' },
  { id: 2, nome: 'Parque Nacional Montanhas do Tumucumaque', uf: 'AP', regiao: 'Norte', lat: 1.833, lng: -53.2, hectares: '3.865.188 ha' },
  { id: 3, nome: 'Parque Nacional do Monte Roraima', uf: 'RR', regiao: 'Norte', lat: 5.143, lng: -60.762, hectares: '116.747 ha' },
  { id: 4, nome: 'Parque Nacional do Pico da Neblina', uf: 'AM', regiao: 'Norte', lat: 0.8, lng: -66.0, hectares: '2.252.616 ha' },
  { id: 5, nome: 'Parque Nacional da Amazônia', uf: 'PA', regiao: 'Norte', lat: -4.55, lng: -56.83, hectares: '1.084.895 ha' },
  { id: 6, nome: 'Parque Nacional dos Lençóis Maranhenses', uf: 'MA', regiao: 'Nordeste', lat: -2.485, lng: -43.128, hectares: '156.584 ha' },
  { id: 7, nome: 'Parque Nacional de Jericoacoara', uf: 'CE', regiao: 'Nordeste', lat: -2.797, lng: -40.514, hectares: '8.863 ha' },
  { id: 8, nome: 'Parque Nacional da Chapada Diamantina', uf: 'BA', regiao: 'Nordeste', lat: -12.883, lng: -41.367, hectares: '152.142 ha' },
  { id: 9, nome: 'Parque Nacional Serra da Capivara', uf: 'PI', regiao: 'Nordeste', lat: -8.833, lng: -42.55, hectares: '91.848 ha' },
  { id: 10, nome: 'Parque Nacional Marinho de Fernando de Noronha', uf: 'PE', regiao: 'Nordeste', lat: -3.854, lng: -32.423, hectares: '10.927 ha' },
  { id: 11, nome: 'Parque Nacional do Catimbau', uf: 'PE', regiao: 'Nordeste', lat: -8.573, lng: -37.246, hectares: '62.294 ha' },
  { id: 12, nome: 'Parque Nacional da Chapada dos Veadeiros', uf: 'GO', regiao: 'Centro-Oeste', lat: -14.1, lng: -47.667, hectares: '240.611 ha' },
  { id: 13, nome: 'Parque Nacional da Chapada dos Guimarães', uf: 'MT', regiao: 'Centro-Oeste', lat: -15.4, lng: -55.833, hectares: '32.769 ha' },
  { id: 14, nome: 'Parque Nacional do Pantanal Matogrossense', uf: 'MT', regiao: 'Centro-Oeste', lat: -17.65, lng: -57.417, hectares: '135.606 ha' },
  { id: 15, nome: 'Parque Nacional das Emas', uf: 'GO', regiao: 'Centro-Oeste', lat: -18.108, lng: -52.927, hectares: '132.642 ha' },
  { id: 16, nome: 'Parque Nacional de Brasília', uf: 'DF', regiao: 'Centro-Oeste', lat: -15.717, lng: -47.967, hectares: '42.355 ha' },
  { id: 17, nome: 'Parque Nacional da Tijuca', uf: 'RJ', regiao: 'Sudeste', lat: -22.951, lng: -43.285, hectares: '3.958 ha' },
  { id: 18, nome: 'Parque Nacional do Itatiaia', uf: 'RJ', regiao: 'Sudeste', lat: -22.383, lng: -44.667, hectares: '28.084 ha' },
  { id: 19, nome: 'Parque Nacional da Serra dos Órgãos', uf: 'RJ', regiao: 'Sudeste', lat: -22.467, lng: -43.0, hectares: '20.020 ha' },
  { id: 20, nome: 'Parque Nacional da Serra da Canastra', uf: 'MG', regiao: 'Sudeste', lat: -20.25, lng: -46.5, hectares: '197.810 ha' },
  { id: 21, nome: 'Parque Nacional do Caparaó', uf: 'MG', regiao: 'Sudeste', lat: -20.433, lng: -41.817, hectares: '31.762 ha' },
  { id: 22, nome: 'Parque Nacional da Serra do Cipó', uf: 'MG', regiao: 'Sudeste', lat: -19.35, lng: -43.55, hectares: '31.639 ha' },
  { id: 23, nome: 'Parque Nacional do Iguaçu', uf: 'PR', regiao: 'Sul', lat: -25.633, lng: -54.217, hectares: '169.695 ha' },
  { id: 24, nome: 'Parque Nacional de Aparados da Serra', uf: 'RS', regiao: 'Sul', lat: -29.183, lng: -50.1, hectares: '13.141 ha' },
  { id: 25, nome: 'Parque Nacional da Serra Geral', uf: 'RS', regiao: 'Sul', lat: -29.117, lng: -49.983, hectares: '17.301 ha' },
  { id: 26, nome: 'Parque Nacional de São Joaquim', uf: 'SC', regiao: 'Sul', lat: -28.133, lng: -49.483, hectares: '49.300 ha' },
];

/**
 * Normaliza texto para busca fluida sem sensibilidade a acentos ou maiúsculas.
 */
function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Escapa caracteres HTML para evitar injeção ao montar o conteúdo do popup.
 */
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Injeta um stylesheet CSS uma única vez no <head>.
 */
function ensureStylesheet(href) {
  if (document.querySelector(`link[data-pn-href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.pnHref = href;
  document.head.appendChild(link);
}

/**
 * Carrega um script externo uma única vez e retorna uma Promise.
 */
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-pn-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error(`Falha ao carregar script: ${src}`)),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.pnSrc = src;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true }
    );
    script.addEventListener(
      'error',
      () => reject(new Error(`Falha ao carregar script: ${src}`)),
      { once: true }
    );
    document.head.appendChild(script);
  });
}

let leafletLoaderPromise = null;

/**
 * Carrega Leaflet e Leaflet.markercluster em ordem e retorna `window.L`.
 */
function loadLeafletWithClusters() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Ambiente sem DOM.'));
  }

  if (window.L && typeof window.L.markerClusterGroup === 'function') {
    return Promise.resolve(window.L);
  }

  if (!leafletLoaderPromise) {
    leafletLoaderPromise = (async () => {
      LEAFLET_ASSETS.css.forEach(ensureStylesheet);
      await loadScriptOnce(LEAFLET_ASSETS.leafletJs);
      await loadScriptOnce(LEAFLET_ASSETS.clusterJs);

      if (!window.L || typeof window.L.markerClusterGroup !== 'function') {
        throw new Error('Leaflet ou MarkerCluster não foi inicializado corretamente.');
      }
      return window.L;
    })().catch((err) => {
      leafletLoaderPromise = null;
      throw err;
    });
  }

  return leafletLoaderPromise;
}

/**
 * Cria o ícone customizado dos clusters de parques escalonado por quantidade.
 */
function createClusterIcon(L, cluster) {
  const count = cluster.getChildCount();
  let sizeClass = 'pn-cluster-sm';
  let size = 34;

  if (count >= 25) {
    sizeClass = 'pn-cluster-lg';
    size = 46;
  } else if (count >= 10) {
    sizeClass = 'pn-cluster-md';
    size = 40;
  }

  return L.divIcon({
    html: `<div class="pn-cluster-badge ${sizeClass}"><span>${count}</span></div>`,
    className: 'pn-cluster-wrapper',
    iconSize: L.point(size, size, true),
  });
}

/**
 * Constrói o elemento DOM do Popup para cada parque com suporte a callback React.
 */
function buildPopupElement(parque, onSelectPark) {
  const container = document.createElement('div');
  container.className = 'pn-popup-content';

  const artigoUrl = parque.artigoUrl || COMMUNITY_URL;
  const hectaresHtml = parque.hectares
    ? `<p class="pn-popup-meta"><strong>Área:</strong> ${escapeHtml(parque.hectares)}</p>`
    : '';

  container.innerHTML = `
    <p class="pn-popup-eyebrow">${escapeHtml(parque.regiao)} &bull; ESTADO: ${escapeHtml(parque.uf)}</p>
    <h3 class="pn-popup-title">${escapeHtml(parque.nome)}</h3>
    <div class="pn-popup-details">
      ${hectaresHtml}
      <p class="pn-popup-meta"><strong>Coordenadas:</strong> ${Number(parque.lat).toFixed(4)}, ${Number(parque.lng).toFixed(4)}</p>
    </div>
  `;

  const actionWrapper = document.createElement('div');
  actionWrapper.className = 'pn-popup-actions';

  if (typeof onSelectPark === 'function') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pn-popup-btn';
    btn.textContent = 'Ver página do parque';
    btn.addEventListener('click', () => onSelectPark(parque));
    actionWrapper.appendChild(btn);
  } else {
    const link = document.createElement('a');
    link.href = artigoUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'pn-popup-btn';
    link.textContent = 'Ler Artigos →';
    actionWrapper.appendChild(link);
  }

  container.appendChild(actionWrapper);
  return container;
}

/**
 * Item memoizado da lista lateral de parques para manter a digitação fluida.
 */
const SidebarParkItem = memo(function SidebarParkItem({
  parque,
  isSelected,
  onClick,
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onClick(parque)}
        className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm'
            : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold leading-snug">
            {parque.nome}
          </span>
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
            {parque.uf}
          </span>
        </div>
        {parque.hectares && (
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
            <span>{parque.hectares}</span>
          </p>
        )}
      </button>
    </li>
  );
});

/**
 * InteractiveMap — Home pública do projeto Parques Nacionais do Brasil.
 *
 * Projetado para carregamento rápido:
 * - Clusterização assíncrona (`chunkedLoading: true`) via Leaflet.markercluster
 * - Renderização em Canvas (`preferCanvas: true`) e ícone compartilhado
 * - Busca fluida sem travamentos com `useDeferredValue` e índice pré-normalizado
 * - Acesso 100% liberado para turistas/visitantes não logados
 */
export function InteractiveMap({
  parques,
  isLoading = false,
  error = null,
  user = null,
  onLoginClick,
  onSelectPark,
}) {
  // Usa os parques passados por prop ou o conjunto padrão no Preview
  const sourceParques =
    Array.isArray(parques) && parques.length > 0 ? parques : DEFAULT_PARQUES;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('TODAS');
  const [tileMode, setTileMode] = useState('street');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPark, setSelectedPark] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Mantém a digitação instantânea na barra lateral mesmo durante re-clusterização
  const deferredQuery = useDeferredValue(searchQuery);
  const isFiltering = searchQuery !== deferredQuery;

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const markerIconRef = useRef(null);
  const markerRefs = useRef(new Map());
  const onSelectParkRef = useRef(onSelectPark);

  useEffect(() => {
    onSelectParkRef.current = onSelectPark;
  }, [onSelectPark]);

  // Pré-indexa strings normalizadas uma única vez quando o array de parques muda
  const indexedParques = useMemo(() => {
    return sourceParques
      .filter(
        (p) =>
          p != null &&
          Number.isFinite(Number(p.lat)) &&
          Number.isFinite(Number(p.lng))
      )
      .map((p) => ({
        ...p,
        lat: Number(p.lat),
        lng: Number(p.lng),
        _searchKey: normalizeText(`${p.nome} ${p.uf} ${p.regiao}`),
      }));
  }, [sourceParques]);

  const filteredParques = useMemo(() => {
    const query = normalizeText(deferredQuery);

    return indexedParques.filter((parque) => {
      const matchesRegion =
        selectedRegion === 'TODAS' || parque.regiao === selectedRegion;
      if (!matchesRegion) return false;
      if (!query) return true;
      return parque._searchKey.includes(query);
    });
  }, [indexedParques, deferredQuery, selectedRegion]);

  // Agrupa resultados por região para a barra lateral
  const groupedParques = useMemo(() => {
    const groups = new Map();
    for (const parque of filteredParques) {
      const regiao = parque.regiao || 'Outros';
      if (!groups.has(regiao)) groups.set(regiao, []);
      groups.get(regiao).push(parque);
    }
    return Array.from(groups.entries());
  }, [filteredParques]);

  // Inicializa o mapa Leaflet e o MarkerClusterGroup uma única vez
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      try {
        const L = await loadLeafletWithClusters();
        if (isCancelled || !mapContainerRef.current) return;

        // Garante que não há instância anterior no mesmo container
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: BRAZIL_CENTER,
          zoom: INITIAL_ZOOM,
          minZoom: 3,
          maxZoom: 18,
          preferCanvas: true,
          zoomControl: true,
        });

        const initialTile = TILE_LAYERS.street;
        const tileLayer = L.tileLayer(initialTile.url, {
          attribution: initialTile.attribution,
          subdomains: initialTile.subdomains,
          keepBuffer: 2,
          updateWhenIdle: true,
          updateWhenZooming: false,
        }).addTo(map);

        const clusterGroup = L.markerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 55,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          removeOutsideVisibleBounds: true,
          iconCreateFunction: (cluster) => createClusterIcon(L, cluster),
        });

        map.addLayer(clusterGroup);

        // Ícone único compartilhado por todos os marcadores (alta performance)
        markerIconRef.current = L.divIcon({
          className: 'pn-marker-wrapper',
          html: '<span class="pn-marker-dot" aria-hidden="true"></span>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          popupAnchor: [0, -10],
        });

        mapInstanceRef.current = map;
        tileLayerRef.current = tileLayer;
        clusterGroupRef.current = clusterGroup;
        setMapReady(true);
      } catch (err) {
        if (!isCancelled) {
          setMapError(
            err?.message || 'Não foi possível carregar o mapa interativo.'
          );
        }
      }
    }

    initMap();

    return () => {
      isCancelled = true;
      markerRefs.current.clear();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      tileLayerRef.current = null;
      clusterGroupRef.current = null;
    };
  }, []);

  // Atualiza a camada base (Mapa / Satélite) sem recriar o mapa
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = typeof window !== 'undefined' ? window.L : null;
    if (!mapReady || !map || !L) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const activeTile = TILE_LAYERS[tileMode];
    tileLayerRef.current = L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      subdomains: activeTile.subdomains,
      keepBuffer: 2,
      updateWhenIdle: true,
      updateWhenZooming: false,
    }).addTo(map);
  }, [tileMode, mapReady]);

  // Atualiza os marcadores em lote no MarkerClusterGroup quando o filtro muda
  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    const L = typeof window !== 'undefined' ? window.L : null;
    if (!mapReady || !clusterGroup || !L) return;

    clusterGroup.clearLayers();
    markerRefs.current.clear();

    const newMarkers = filteredParques.map((parque) => {
      const marker = L.marker([parque.lat, parque.lng], {
        icon: markerIconRef.current,
      });

      marker.bindTooltip(escapeHtml(parque.nome), {
        direction: 'top',
        offset: [0, -8],
        opacity: 0.95,
      });

      marker.bindPopup(() => buildPopupElement(parque, onSelectParkRef.current), {
        minWidth: 230,
        maxWidth: 280,
      });

      marker.on('click', () => {
        setSelectedPark(parque);
      });

      markerRefs.current.set(parque.id, marker);
      return marker;
    });

    // Adiciona todos de uma só vez aproveitando o chunkedLoading
    clusterGroup.addLayers(newMarkers);
  }, [filteredParques, mapReady]);

  // Recalcula o tamanho do mapa quando a barra lateral abre/fecha
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapReady || !map) return;

    const timer = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 260);
    return () => clearTimeout(timer);
  }, [sidebarOpen, mapReady]);

  const handleParkFocus = useCallback((parque) => {
    setSelectedPark(parque);

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }

    const map = mapInstanceRef.current;
    const clusterGroup = clusterGroupRef.current;
    const targetMarker = markerRefs.current.get(parque.id);

    if (!map) return;

    if (targetMarker && clusterGroup?.zoomToShowLayer) {
      clusterGroup.zoomToShowLayer(targetMarker, () => {
        targetMarker.openPopup();
      });
      return;
    }

    map.flyTo([parque.lat, parque.lng], 10, {
      duration: 0.9,
      easeLinearity: 0.25,
    });
  }, []);

  const handleResetView = useCallback(() => {
    setSelectedPark(null);
    const map = mapInstanceRef.current;
    if (!map) return;
    map.closePopup();
    map.flyTo(BRAZIL_CENTER, INITIAL_ZOOM, { duration: 0.85 });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedRegion('TODAS');
    setSelectedPark(null);
    const map = mapInstanceRef.current;
    if (map) {
      map.closePopup();
      map.flyTo(BRAZIL_CENTER, INITIAL_ZOOM, { duration: 0.85 });
    }
  }, []);

  const toggleTileMode = useCallback(() => {
    setTileMode((prev) => (prev === 'street' ? 'satellite' : 'street'));
  }, []);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Estilos leves para marcadores, clusters e popups */}
      <style>{`
        .pn-marker-wrapper {
          background: transparent;
          border: none;
        }
        .pn-marker-dot {
          display: block;
          width: 14px;
          height: 14px;
          margin: 2px;
          border-radius: 9999px;
          background: #059669;
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.28);
          transition: transform 0.15s ease, background-color 0.15s ease;
        }
        .pn-marker-wrapper:hover .pn-marker-dot {
          transform: scale(1.22);
          background: #047857;
        }
        .pn-cluster-wrapper {
          background: transparent;
          border: none;
        }
        .pn-cluster-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          color: #ffffff;
          font-weight: 700;
          font-size: 12px;
          border: 3px solid rgba(255, 255, 255, 0.92);
          box-shadow: 0 4px 12px rgba(6, 78, 59, 0.28);
        }
        .pn-cluster-sm { background: #10b981; }
        .pn-cluster-md { background: #059669; }
        .pn-cluster-lg { background: #047857; }
        .pn-popup-content {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          color: #1e293b;
          padding: 2px 0;
        }
        .pn-popup-eyebrow {
          margin: 0 0 4px 0;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #047857;
        }
        .pn-popup-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.3;
          color: #0f172a;
        }
        .pn-popup-details {
          margin-bottom: 10px;
        }
        .pn-popup-meta {
          margin: 2px 0;
          font-size: 12px;
          color: #475569;
        }
        .pn-popup-actions {
          display: flex;
        }
        .pn-popup-btn {
          display: inline-flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 6px;
          background: #059669;
          color: #ffffff !important;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .pn-popup-btn:hover {
          background: #047857;
        }
      `}</style>

      {/* Cabeçalho da Home */}
      <header className="z-30 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={
              sidebarOpen ? 'Ocultar barra de busca' : 'Abrir barra de busca'
            }
            aria-expanded={sidebarOpen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4 text-emerald-700" />
            ) : (
              <PanelLeftOpen className="h-4 w-4 text-emerald-700" />
            )}
            <span>{sidebarOpen ? 'Ocultar lista' : 'Buscar parques'}</span>
          </button>

          <div className="flex items-center gap-2">
            <Compass className="hidden h-5 w-5 text-emerald-700 sm:block" />
            <div>
              <h1 className="text-base font-bold leading-tight text-emerald-900 sm:text-lg">
                Parques Nacionais do Brasil
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Projeto de Extensão e Cultura UFABC
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            Exibindo: {filteredParques.length} / {indexedParques.length}
          </span>

          <button
            type="button"
            onClick={toggleTileMode}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <Layers className="h-3.5 w-3.5 text-slate-600" />
            <span>{tileMode === 'street' ? 'Satélite' : 'Mapa'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Visão Geral</span>
          </button>

          {/* Login opcional: nunca bloqueia o uso da Home por visitantes */}
          {!user && onLoginClick && (
            <button
              type="button"
              onClick={onLoginClick}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* Corpo principal: Barra lateral + Mapa */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Overlay mobile quando a barra lateral está aberta */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 z-20 bg-slate-900/30 md:hidden"
          />
        )}

        {/* Barra lateral de busca fluida (acessível sem login) */}
        <aside
          aria-label="Busca e filtros de parques nacionais"
          className={`absolute inset-y-0 left-0 z-20 flex w-80 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 ease-out md:static md:shadow-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
          }`}
        >
          {/* Campo de busca */}
          <div className="border-b border-slate-200 p-3">
            <label htmlFor="park-search-input" className="sr-only">
              Buscar parque por nome, estado ou região
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="park-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchQuery('');
                }}
                placeholder="Buscar parque, estado (UF) ou região..."
                autoComplete="off"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pr-8 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpar busca"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Chips de filtro por região */}
            <div
              className="mt-2.5 flex flex-wrap gap-1.5"
              role="group"
              aria-label="Filtrar por região"
            >
              {REGIONS.map((region) => {
                const active = selectedRegion === region;
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setSelectedRegion(region)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista rolável de parques */}
          <div
            className={`min-h-0 flex-1 overflow-y-auto p-3 transition-opacity ${
              isFiltering ? 'opacity-70' : 'opacity-100'
            }`}
          >
            {error && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                {error}
              </div>
            )}

            {isLoading && indexedParques.length === 0 ? (
              <div className="space-y-2.5" aria-busy="true">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-14 animate-pulse rounded-lg bg-slate-100"
                  />
                ))}
              </div>
            ) : groupedParques.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-slate-600">
                  Nenhum parque encontrado.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-2 text-xs font-semibold text-emerald-700 underline hover:text-emerald-800"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedParques.map(([regiao, items]) => (
                  <section key={regiao}>
                    <h2 className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <span>{regiao}</span>
                      <span>{items.length}</span>
                    </h2>
                    <ul className="space-y-1.5">
                      {items.map((parque) => (
                        <SidebarParkItem
                          key={parque.id}
                          parque={parque}
                          isSelected={selectedPark?.id === parque.id}
                          onClick={handleParkFocus}
                        />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé público da barra lateral */}
          <div className="border-t border-slate-200 bg-slate-50 px-3 py-2.5">
            <a
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <span>Comunidade Parques Nacionais</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </aside>

        {/* Área do Mapa */}
        <main className="relative min-h-0 flex-1 bg-slate-200">
          {!mapReady && !mapError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-slate-50/90 text-slate-600">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Carregando mapa interativo...</p>
            </div>
          )}

          {mapError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
              <div className="max-w-sm rounded-xl border border-red-200 bg-white p-5 text-center shadow-sm">
                <p className="text-sm font-semibold text-red-700">
                  Erro ao carregar o mapa
                </p>
                <p className="mt-1 text-xs text-slate-600">{mapError}</p>
              </div>
            </div>
          )}

          <div
            ref={mapContainerRef}
            className="h-full w-full z-10"
            role="application"
            aria-label="Mapa interativo dos Parques Nacionais do Brasil"
          />
        </main>
      </div>
    </div>
  );
}

export default function App(props) {
  return <InteractiveMap {...props} />;
}