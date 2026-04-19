import React, { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';

const BASE_URL = import.meta.env.VITE_API_URL ;

function App({ mapMode }) {
  const [intelData, setIntelData] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [ingestionTab, setIngestionTab] = useState('HUMINT');
  const [showIngestion, setShowIngestion] = useState(false);
  const [selectedHumintFile, setSelectedHumintFile] = useState(null);
  const [selectedImintFile, setSelectedImintFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filterType, searchTerm, dateFilter]);

  useEffect(() => {
    const socket = io(BASE_URL);
    socket.on('intel:update', () => fetchData());
    return () => socket.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (searchTerm) params.append('search', searchTerm);
      if (dateFilter) params.append('date', dateFilter);

      const response = await fetch(`${BASE_URL}/api/data?${params.toString()}`, { credentials: "include" });
      if (!response.ok) return setIntelData([]);
      const data = await response.json();
      setIntelData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('input[type="file"]');
    const file = fileInput?.files[0];
    
    if (!file) {
      setUploadStatus("ERROR: NO PAYLOAD DETECTED");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus('SYNCING NODES...');
      const response = await fetch(`${BASE_URL}/api/humint`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const result = await response.json();
      setUploadStatus(`SYNC COMPLETE: ${result.inserted} NODES`);
      setSelectedHumintFile(null);
      fetchData();
      e.target.reset();
      setTimeout(() => setUploadStatus(''), 4000);
    } catch (error) {
      setUploadStatus('SYNC ERROR');
    }
  };

  const handleImintUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      setUploadStatus('UPLOADING IMINT...');
      const response = await fetch(`${BASE_URL}/api/imint`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Upload failed');
      setUploadStatus('IMINT DEPLOYED');
      setSelectedImintFile(null);
      fetchData();
      e.target.reset();
      setTimeout(() => setUploadStatus(''), 4000);
    } catch (error) {
      setUploadStatus(`ERROR: ${error.message}`);
    }
  };

  const markers = useMemo(() => {
    return intelData.map(item => {
      let markerColor = '#3b82f6'; // Blue (OSINT)
      if (item.source === 'HUMINT') markerColor = '#facc15'; // Yellow
      if (item.source === 'IMINT') markerColor = '#ef4444'; // Red

      return {
        id: item._id,
        lat: item.location?.coordinates?.[1] || 0,
        lng: item.location?.coordinates?.[0] || 0,
        title: item.title,
        description: item.description,
        type: item.source,
        color: markerColor,
        image: item.mediaUrl
      };
    }).filter(m => m.lat !== 0 && m.lng !== 0);
  }, [intelData]);

  return (
    <div className="w-full h-full relative">
      {/* MAP VIEW */}
      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
      >
        <TileLayer
          url={mapMode === 'sat' 
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
          attribution={mapMode === 'sat' ? 'Tiles &copy; Esri' : '&copy; CARTO'}
        />
        
        <MarkerClusterGroup chunkedLoading>
          {markers.map(marker => (
            <CircleMarker
              key={marker.id}
              center={[marker.lat, marker.lng]}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  setSelected(marker);
                }
              }}
              pathOptions={{
                color: marker.color,
                fillColor: marker.color,
                fillOpacity: 0.8,
                weight: 1.5,
                className: 'neon-glow-cyan'
              }}
              radius={7}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                <div className="popup-card">
                  <div className="flex justify-between items-start mb-3 border-b border-border border-opacity-30 pb-2">
                    <h3 className="text-[11px] font-orbitron font-bold uppercase tracking-wider text-white">{marker.title}</h3>
                    <span className="text-[8px] font-mono px-2 py-0.5 border font-bold rounded-full" 
                          style={{ color: marker.color, borderColor: marker.color, backgroundColor: `${marker.color}1A` }}>
                      {marker.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-dim mb-3 font-body leading-relaxed">
                    {marker.description}
                  </p>
                  {marker.image && <img src={marker.image} alt={marker.title} />}
                  <div className="flex justify-between items-center text-[9px] font-mono text-primary text-opacity-80 pt-2 border-t border-border border-opacity-20">
                    <span>{marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</span>
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* INTEL LEGEND */}
      <div className="absolute bottom-12 left-4 lg:bottom-6 lg:left-6 glass-panel p-3 lg:p-4 z-[1000] border border-border border-opacity-30 shadow-2xl animate-fadeInSlideUp hidden sm:block">
        <div className="mb-2 lg:mb-3 font-orbitron text-[8px] lg:text-[9px] font-bold tracking-[0.2em] text-primary">INTEL LEGEND</div>
        <div className="space-y-2 lg:space-y-2.5">
          <div className="flex items-center gap-2 lg:gap-3 group cursor-default">
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#facc15] shadow-[0_0_8px_rgba(250,204,21,0.4)] group-hover:scale-125 transition-transform"></div>
            <span className="text-[8px] lg:text-[9px] font-mono font-bold text-on-surface-dim tracking-widest uppercase group-hover:text-white transition-colors">HUMINT</span>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 group cursor-default">
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.4)] group-hover:scale-125 transition-transform"></div>
            <span className="text-[8px] lg:text-[9px] font-mono font-bold text-on-surface-dim tracking-widest uppercase group-hover:text-white transition-colors">IMINT</span>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 group cursor-default">
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.4)] group-hover:scale-125 transition-transform"></div>
            <span className="text-[8px] lg:text-[9px] font-mono font-bold text-on-surface-dim tracking-widest uppercase group-hover:text-white transition-colors">OSINT</span>
          </div>
        </div>
      </div>

      {/* FLOATING HUD CONTROLS - TOP LEFT */}
      <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex flex-col gap-4 z-[1000] w-[calc(100%-2rem)] sm:w-auto">
        <div className="glass-panel p-3 lg:p-4 flex flex-col gap-3 min-w-0 sm:min-w-[240px]">
           <div className="flex items-center justify-between">
              <span className="text-[8px] lg:text-[9px] font-orbitron font-bold tracking-widest text-primary text-opacity-80 uppercase">Target Search</span>
              <span className="text-[8px] lg:text-[9px] font-mono text-secondary">{markers.length} ACTIVE</span>
           </div>
           <div className="relative">
              <input 
                type="text" 
                placeholder="INPUT FREQUENCY..."
                className="w-full bg-background bg-opacity-50 border border-border border-opacity-50 text-[9px] lg:text-[10px] py-1.5 lg:py-2 px-3 font-mono text-white focus:outline-none focus:border-primary focus:border-opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-primary text-opacity-40 text-sm">search</span>
           </div>
           <select 
              className="w-full bg-background bg-opacity-50 border border-border border-opacity-50 text-[9px] lg:text-[10px] py-1.5 lg:py-2 px-3 font-mono text-on-surface-dim focus:outline-none focus:border-primary focus:border-opacity-50 appearance-none cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
           >
              <option value="">[ ALL CHANNELS ]</option>
              <option value="OSINT">OSINT CHANNEL</option>
              <option value="HUMINT">HUMINT NODES</option>
              <option value="IMINT">IMINT UPLINK</option>
           </select>
        </div>
      </div>

      {/* FLOATING ACTION - BOTTOM RIGHT */}
      <div className="absolute bottom-14 right-4 lg:bottom-16 lg:right-6 flex flex-col gap-3 items-end z-[1000] max-w-[calc(100%-2rem)]">
        {showIngestion && (
          <div className="glass-panel p-4 lg:p-6 w-full sm:w-[320px] mb-2" style={{ animation: 'fadeInSlideUp 0.3s ease-out forwards' }}>
             <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-[9px] lg:text-[10px] font-orbitron font-bold tracking-[0.2em] text-white uppercase">Neural Ingestion</h2>
                <button onClick={() => setShowIngestion(false)} className="text-on-surface-dim hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
             </div>
             
             <div className="flex gap-2 mb-4 lg:mb-6">
                <button onClick={() => setIngestionTab('HUMINT')} className={`flex-1 py-1.5 lg:py-2 text-[8px] lg:text-[9px] font-mono border ${ingestionTab === 'HUMINT' ? 'border-primary text-primary bg-primary bg-opacity-5' : 'border-border text-on-surface-dim'}`}>HUMINT</button>
                <button onClick={() => setIngestionTab('IMINT')} className={`flex-1 py-1.5 lg:py-2 text-[8px] lg:text-[9px] font-mono border ${ingestionTab === 'IMINT' ? 'border-accent text-accent bg-accent bg-opacity-5' : 'border-border text-on-surface-dim'}`}>IMINT</button>
             </div>

             {ingestionTab === 'HUMINT' ? (
                <form onSubmit={handleUpload} className="space-y-3 lg:space-y-4">
                   <div className="border border-dashed border-border p-4 lg:p-8 flex flex-col items-center gap-2 lg:gap-3 hover:border-primary hover:border-opacity-50 transition-colors cursor-pointer relative">
                      <input type="file" name="file" className="absolute inset-0 opacity-0 cursor-pointer" required onChange={(e) => setSelectedHumintFile(e.target.files[0]?.name)} />
                      <span className="material-symbols-outlined text-primary text-2xl lg:text-3xl">cloud_upload</span>
                      <span className="text-[8px] lg:text-[9px] font-mono text-on-surface-dim uppercase text-center">{selectedHumintFile ? `PAYLOAD: ${selectedHumintFile}` : 'DEPLOY CSV PAYLOAD'}</span>
                   </div>
                   <button type="submit" className="w-full btn-tactical-primary py-2 lg:py-3 text-[9px]">Execute Protocol</button>
                </form>
             ) : (
                <form onSubmit={handleImintUpload} className="space-y-2 lg:space-y-3">
                   <input name="title" placeholder="INTEL ID" className="w-full bg-background bg-opacity-50 border border-border border-opacity-50 text-[9px] lg:text-[10px] py-1.5 lg:py-2 px-3 font-mono text-white focus:outline-none" required />
                   <textarea name="description" placeholder="BRIEFING" className="w-full bg-background bg-opacity-50 border border-border border-opacity-50 text-[9px] lg:text-[10px] p-2 lg:p-3 font-mono text-white focus:outline-none h-16 lg:h-20" required />
                   <div className="grid grid-cols-2 gap-2">
                      <input name="lat" placeholder="LAT" className="bg-background bg-opacity-50 border border-border border-opacity-50 text-[9px] lg:text-[10px] py-1.5 lg:py-2 px-3 font-mono text-white focus:outline-none" required />
                      <input name="lng" placeholder="LNG" className="bg-background bg-opacity-50 border border-border border-opacity-50 text-[9px] lg:text-[10px] py-1.5 lg:py-2 px-3 font-mono text-white focus:outline-none" required />
                   </div>
                   <div className="border border-dashed border-border border-opacity-50 p-2 lg:p-3 flex flex-col items-center gap-1.5 lg:gap-2 hover:border-accent hover:border-opacity-50 transition-colors cursor-pointer relative bg-background bg-opacity-20">
                      <input type="file" name="image" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" required onChange={(e) => setSelectedImintFile(e.target.files[0]?.name)} />
                      <span className="material-symbols-outlined text-accent text-lg lg:text-xl">satellite_alt</span>
                      <span className="text-[7px] lg:text-[8px] font-mono text-on-surface-dim uppercase text-center">{selectedImintFile ? `UPLINK: ${selectedImintFile}` : 'Select Satellite Image'}</span>
                   </div>
                   <button type="submit" className="w-full btn-tactical-primary border-accent border-opacity-30 text-accent text-opacity-80 hover:bg-accent hover:border-accent py-2 lg:py-3 text-[9px]">Initialize Uplink</button>
                </form>
             )}

             {uploadStatus && (
                <div className="mt-3 lg:mt-4 p-2 bg-primary bg-opacity-10 border-l-2 border-primary">
                   <p className="text-[8px] lg:text-[9px] font-mono text-primary animate-pulse">{uploadStatus}</p>
                </div>
             )}
          </div>
        )}

        <button 
          onClick={() => setShowIngestion(!showIngestion)}
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${showIngestion ? 'bg-accent text-white rotate-45' : 'bg-primary text-background hover:scale-110'}`}
        >
          <span className="material-symbols-outlined text-xl lg:text-2xl">{showIngestion ? 'add' : 'database'}</span>
        </button>
      </div>

      {/* BOTTOM TICKER */}
      <div className="absolute bottom-0 left-0 w-full h-8 lg:h-10 glass-panel border-t border-border border-opacity-30 flex items-center px-4 lg:px-10 z-50">
          <div className="flex items-center w-full gap-4 lg:gap-8 overflow-hidden">
             <div className="bg-primary bg-opacity-20 border border-primary border-opacity-30 text-primary font-bold font-orbitron text-[7px] lg:text-[8px] px-2 lg:px-3 py-0.5 lg:py-1 uppercase tracking-tighter flex items-center gap-1.5 lg:gap-2 shrink-0">
                <span className="w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full bg-primary animate-ping"></span>
                Feed_Live
             </div>
             
             <div className="flex-1 overflow-hidden relative">
                <div className="flex gap-8 lg:gap-16 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
                   <span className="text-[9px] lg:text-[10px] font-mono text-on-surface-dim uppercase tracking-wider">[OSINT] Intercepted encrypted traffic on frequency 144.20 MHz... Tracking...</span>
                   <span className="text-[9px] lg:text-[10px] font-mono text-on-surface-dim uppercase tracking-wider">[HUMINT] Ground asset confirmed movement in Sector 7 Alpha. Visual confirmation pending.</span>
                   <span className="text-[9px] lg:text-[10px] font-mono text-on-surface-dim uppercase tracking-wider">[IMINT] Satellite passing overhead in T-minus 04:30. Resolution: High.</span>
                   <span className="text-[9px] lg:text-[10px] font-mono text-on-surface-dim uppercase tracking-wider">[SYSTEM] All nodes operational. Security protocol OMEGA engaged.</span>
                </div>
             </div>
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}} />
    </div>
  );
}

export default App;
