import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Locate,
  Navigation,
  Loader2,
  AlertCircle,
  Search,
  RotateCcw,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  getUserCoordinates,
  searchPlacesNearby,
  getCachedCoordinates,
  setCachedCoordinates
} from '../../services/nearbyHospitalsService';
import EmergencyBanner from './EmergencyBanner';
import HospitalResultsList from './HospitalResultsList';

/**
 * LocationPermissionCard
 * 
 * Handles inline location request, manual search fallback,
 * calling places backend proxy, and rendering emergency banner + hospital results.
 */
export default function LocationPermissionCard({ intent }) {
  const isEmergency = intent?.isEmergency || intent?.type === 'emergency';
  const query = intent?.query || (isEmergency ? 'emergency hospital' : 'hospital');
  const specialty = intent?.specialty || (isEmergency ? 'Emergency & Trauma' : null);
  const disease = intent?.disease || null;

  // Status: 'idle' | 'requesting' | 'searching' | 'success' | 'denied' | 'error'
  const [status, setStatus] = useState('idle');
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualArea, setManualArea] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Perform backend hospital search with coordinates
  const executeCoordinateSearch = useCallback(async (coords) => {
    setStatus('searching');
    setStatusMessage(isEmergency ? 'Locating closest emergency centers...' : 'Searching specialized facilities...');

    try {
      const res = await searchPlacesNearby({
        lat: coords.lat,
        lng: coords.lng,
        query,
        specialty,
        is_emergency: isEmergency,
        limit: 5
      });

      setHospitals(res.hospitals || []);
      setUserLocation(coords);
      setStatus('success');
    } catch (err) {
      console.warn('[LocationPermissionCard] Nearby search failed:', err);
      setStatus('error');
      setErrorMessage('Could not load hospital results. Please try searching with your neighborhood name.');
      setShowManualInput(true);
    }
  }, [query, specialty, isEmergency]);

  // Request browser location permission
  const handleRequestLocation = useCallback(async () => {
    setStatus('requesting');
    setStatusMessage('Accessing device location...');
    setErrorMessage('');

    try {
      const coords = await getUserCoordinates();
      setCachedCoordinates(coords);
      await executeCoordinateSearch(coords);
    } catch (err) {
      console.warn('[LocationPermissionCard] Geolocation error:', err.message);
      if (err.message === 'PERMISSION_DENIED') {
        setStatus('denied');
        setErrorMessage('Location permission was denied in your browser settings.');
        setShowManualInput(true);
      } else if (err.message === 'TIMEOUT' || err.message === 'POSITION_UNAVAILABLE') {
        setStatus('error');
        setErrorMessage('Could not determine your device position. Check GPS or network connection.');
        setShowManualInput(true);
      } else {
        setStatus('error');
        setErrorMessage('Unable to obtain location. You can enter your city or zip code manually.');
        setShowManualInput(true);
      }
    }
  }, [executeCoordinateSearch]);

  // Manual location text search
  const handleManualSearch = async (e) => {
    if (e) e.preventDefault();
    const cleanArea = manualArea.trim();
    if (!cleanArea) return;

    setStatus('searching');
    setStatusMessage(`Searching facilities in "${cleanArea}"...`);
    setErrorMessage('');

    try {
      const res = await searchPlacesNearby({
        area_text: cleanArea,
        query,
        specialty,
        is_emergency: isEmergency,
        limit: 5
      });

      setHospitals(res.hospitals || []);
      if (res.center) {
        setUserLocation(res.center);
      }
      setStatus('success');
    } catch (err) {
      console.warn('[LocationPermissionCard] Text search failed:', err);
      setStatus('error');
      setErrorMessage('Search failed. Please verify the area name or try again.');
    }
  };

  // Check cache on mount
  useEffect(() => {
    const cached = getCachedCoordinates();
    if (cached) {
      // Auto-trigger using cached coordinates without asking again
      executeCoordinateSearch(cached);
    }
  }, [executeCoordinateSearch]);

  const cardTitle = isEmergency
    ? 'Nearest Emergency Medical Centers'
    : specialty
      ? `Top ${specialty} Hospitals Near You`
      : 'Find Nearest Healthcare Facilities';

  return (
    <div className="w-full my-3 font-sans animate-fadeIn">
      {/* ─── Emergency Numbers Banner (always visible if emergency) ─── */}
      {isEmergency && <EmergencyBanner query={query} />}

      {/* ─── Main Interactive Permission / Result Card ─── */}
      <div className="w-full max-w-[600px] rounded-2xl border border-frosted-300/80 dark:border-[#1e3854] bg-white/95 dark:bg-[#0d1b2a]/95 shadow-soft overflow-hidden transition-all backdrop-blur-sm">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-gradient-to-r from-frosted-50 via-sky-50/50 to-white dark:from-[#132337] dark:via-[#0f1d2e] dark:to-[#0a1420] border-b border-frosted-200 dark:border-[#1e3854]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${
              isEmergency
                ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                : 'bg-frosted-200/60 dark:bg-frosted-500/20 text-sapphire-700 dark:text-[#38bdf8] border border-frosted-300/60 dark:border-frosted-500/30'
            }`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-sapphire-950 dark:text-[#F1F7FB]">
                {cardTitle}
              </h3>
              <p className="text-[11px] text-sapphire-500 dark:text-slate-400">
                {disease ? `Condition: ${disease}` : specialty ? `Specialty: ${specialty}` : 'GPS-enabled facility finder'}
              </p>
            </div>
          </div>

          {status === 'success' && (
            <button
              onClick={handleRequestLocation}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-sapphire-600 dark:text-[#9FE2EE] hover:bg-frosted-100 dark:hover:bg-[#162a3f] rounded-lg transition-colors"
              title="Refresh location"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {/* ─── State: IDLE / PROMPTING ─── */}
        {status === 'idle' && (
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-sapphire-50 dark:bg-[#13283d] flex items-center justify-center text-sapphire-600 dark:text-[#38bdf8] shrink-0 mt-0.5">
                <Locate className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-sapphire-800 dark:text-[#cbd5e1] leading-relaxed">
                  {isEmergency
                    ? 'Iris can identify the closest 24/7 emergency rooms and trauma care units in seconds using your live location.'
                    : `To show the highest-rated ${specialty || 'medical'} facilities near you, Iris needs permission to access your device location.`}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleRequestLocation}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sapphire-700 hover:bg-sapphire-600 dark:bg-[#0284C7] dark:hover:bg-[#0369A1] text-white text-xs sm:text-sm font-semibold shadow-md shadow-sapphire-900/10 transition-all active:scale-95"
                  >
                    <Locate className="w-4 h-4" />
                    Share My Location
                  </button>

                  <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-frosted-300 dark:border-[#223E5E] text-sapphire-700 dark:text-[#9FE2EE] hover:bg-frosted-50 dark:hover:bg-[#132537] text-xs font-medium transition-all"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Enter location manually
                  </button>
                </div>
              </div>
            </div>

            {/* Manual input dropdown */}
            {showManualInput && (
              <form onSubmit={handleManualSearch} className="mt-4 pt-3.5 border-t border-frosted-200 dark:border-[#1e3854] flex gap-2">
                <input
                  type="text"
                  value={manualArea}
                  onChange={(e) => setManualArea(e.target.value)}
                  placeholder="Enter city, neighborhood, or postal code..."
                  className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-frosted-300 dark:border-[#2a4563] bg-white dark:bg-[#091522] text-sapphire-950 dark:text-white placeholder-sapphire-400 focus:outline-hidden focus:ring-2 focus:ring-sapphire-500/50"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!manualArea.trim()}
                  className="px-4 py-2 rounded-xl bg-sapphire-700 hover:bg-sapphire-600 dark:bg-[#0284C7] text-white text-xs font-semibold disabled:opacity-50 transition-all"
                >
                  Search
                </button>
              </form>
            )}
          </div>
        )}

        {/* ─── State: LOADING (requesting or searching) ─── */}
        {(status === 'requesting' || status === 'searching') && (
          <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-frosted-100 dark:bg-[#132539] flex items-center justify-center text-[#0284C7]">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-sapphire-900 dark:text-white">
                {statusMessage}
              </p>
              <p className="text-[11px] text-sapphire-500 dark:text-slate-400">
                Connecting to Google Places & OpenStreetMap provider
              </p>
            </div>
          </div>
        )}

        {/* ─── State: ERROR / DENIED ─── */}
        {(status === 'denied' || status === 'error') && (
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <span className="font-semibold block">{errorMessage}</span>
                <span className="text-[11px] opacity-90 mt-0.5 block">
                  You can type your city or area below to find hospitals immediately:
                </span>
              </div>
            </div>

            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                value={manualArea}
                onChange={(e) => setManualArea(e.target.value)}
                placeholder="Enter city or area (e.g., Chennai, Downtown Austin)..."
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-frosted-300 dark:border-[#2a4563] bg-white dark:bg-[#091522] text-sapphire-950 dark:text-white placeholder-sapphire-400 focus:outline-hidden focus:ring-2 focus:ring-sapphire-500/50"
              />
              <button
                type="submit"
                disabled={!manualArea.trim()}
                className="px-4 py-2 rounded-xl bg-sapphire-700 hover:bg-sapphire-600 dark:bg-[#0284C7] text-white text-xs font-semibold disabled:opacity-50 transition-all"
              >
                Search
              </button>
            </form>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleRequestLocation}
                className="inline-flex items-center gap-1.5 text-xs text-sapphire-600 dark:text-[#9FE2EE] hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                Retry location access
              </button>
            </div>
          </div>
        )}

        {/* ─── State: SUCCESS (renders HospitalResultsList) ─── */}
        {status === 'success' && (
          <div className="p-2 sm:p-3">
            {hospitals.length === 0 ? (
              <div className="p-4 text-center text-xs text-sapphire-600 dark:text-slate-400">
                No facilities found directly nearby. Try expanding your search area.
              </div>
            ) : (
              <HospitalResultsList
                hospitals={hospitals}
                userLocation={userLocation}
                title={cardTitle}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
