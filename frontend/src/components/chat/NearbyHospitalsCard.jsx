import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  ExternalLink,
  AlertCircle,
  Locate,
  RotateCcw,
  Building2,
  Clock,
  Star,
  CheckCircle2,
  Compass
} from 'lucide-react';
import IrisLogo from '../shared/IrisLogo';
import { getUserCoordinates, fetchNearbyHospitals, getDirectionsUrl } from '../../services/nearbyHospitalsService';

export default function NearbyHospitalsCard({ message }) {
  const [status, setStatus] = useState('prompting'); // 'prompting' | 'loading' | 'success' | 'denied' | 'error'
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [manualCity, setManualCity] = useState('');

  const requestLocationAndFetch = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const coords = await getUserCoordinates();
      setUserLocation(coords);

      const res = await fetchNearbyHospitals(coords.lat, coords.lng);
      setHospitals(res.hospitals || []);
      setStatus('success');
    } catch (err) {
      console.warn('[NearbyHospitalsCard] Location error:', err.message);
      if (err.message === 'PERMISSION_DENIED') {
        setStatus('denied');
        setErrorMessage('Location permission was denied. Please allow location access in your browser to find facilities near you.');
      } else if (err.message === 'TIMEOUT' || err.message === 'POSITION_UNAVAILABLE') {
        setStatus('error');
        setErrorMessage('Could not determine your exact position. Please check your device location services.');
      } else {
        setStatus('error');
        setErrorMessage('Unable to retrieve location. You can search directly on Google Maps below.');
      }
    }
  };

  useEffect(() => {
    // Automatically attempt to prompt location when this card appears
    requestLocationAndFetch();
  }, []);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    const gmapsUrl = `https://www.google.com/maps/search/hospitals+in+${encodeURIComponent(manualCity.trim())}`;
    window.open(gmapsUrl, '_blank', 'noopener,noreferrer');
  };

  const fullMapsUrl = userLocation
    ? `https://www.google.com/maps/search/hospitals/@${userLocation.lat},${userLocation.lng},14z`
    : `https://www.google.com/maps/search/hospitals+near+me`;

  return (
    <div className="w-full my-4 animate-fadeIn font-sans">
      <div className="rounded-2xl border border-sapphire-200/70 dark:border-[#1e3854] bg-white/90 dark:bg-[#0d1b2a]/95 backdrop-blur-md shadow-card overflow-hidden transition-all">
        
        {/* Card Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-sapphire-50/90 via-sky-50/70 to-white dark:from-[#132337] dark:via-[#0f1d2e] dark:to-[#0a1420] border-b border-sapphire-100/70 dark:border-[#1e3854]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sapphire-600/10 dark:bg-sapphire-600/20 border border-sapphire-200 dark:border-sapphire-700 flex items-center justify-center text-sapphire-700 dark:text-[#38bdf8] shadow-sm">
              <MapPin className="w-4 h-4 text-sapphire-600 dark:text-[#38bdf8] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-sapphire-950 dark:text-[#F1F7FB] font-display">
                  Nearby Hospitals & Medical Facilities
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100/80 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                  Emergency Ready
                </span>
              </div>
              <p className="text-xs text-sapphire-600 dark:text-[#82A8D2] font-medium">
                {status === 'success' && userLocation
                  ? `Located at ${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)} • Live GPS`
                  : 'Detecting closest emergency rooms and urgent care centers'}
              </p>
            </div>
          </div>

          <div className="hidden xs:flex items-center gap-1.5 text-xs text-sapphire-500 dark:text-[#82A8D2]">
            <IrisLogo className="w-4 h-4 opacity-70" />
            <span className="text-[11px] font-mono">Location AI</span>
          </div>
        </div>

        {/* Card Body by State */}
        <div className="p-4 sm:p-6">
          
          {/* Introductory Assistant Note */}
          {message?.text && (
            <p className="text-sm text-sapphire-900 dark:text-[#CBD5E1] mb-4 leading-relaxed">
              {message.text}
            </p>
          )}

          {/* STATE: Loading */}
          {status === 'loading' && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4">
                <div className="w-12 h-12 rounded-full border-3 border-sapphire-200 dark:border-[#1e3854] border-t-sapphire-600 dark:border-t-[#38bdf8] animate-spin" />
                <Compass className="w-5 h-5 text-sapphire-600 dark:text-[#38bdf8] absolute inset-0 m-auto" />
              </div>
              <p className="text-sm font-semibold text-sapphire-900 dark:text-[#F1F7FB]">
                Detecting your device location...
              </p>
              <p className="text-xs text-sapphire-600 dark:text-[#94A3B8] mt-1 max-w-sm">
                Please allow browser location permissions if prompted to find the nearest emergency centers.
              </p>
            </div>
          )}

          {/* STATE: Denied or Error */}
          {(status === 'denied' || status === 'error') && (
            <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900">
                    {status === 'denied' ? 'Location Access Blocked' : 'Location Lookup Unavailable'}
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {errorMessage}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={requestLocationAndFetch}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sapphire-600 text-white text-xs font-semibold hover:bg-sapphire-700 transition shadow-sm active:scale-95"
                    >
                      <Locate className="w-3.5 h-3.5" />
                      Allow Location & Retry
                    </button>

                    <a
                      href="https://www.google.com/maps/search/hospitals+near+me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-sapphire-200 text-sapphire-800 text-xs font-semibold hover:bg-sapphire-50 transition shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-sapphire-600" />
                      Open Google Maps Directly
                    </a>
                  </div>

                  {/* Manual City / Area Search */}
                  <form onSubmit={handleManualSearch} className="mt-4 pt-3 border-t border-amber-200/50 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Or enter city / zip code (e.g. Dallas, TX)..."
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sapphire-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 transition"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* STATE: Success (List of hospitals) */}
          {status === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-sapphire-700 dark:text-[#82A8D2] pb-1">
                <span className="font-semibold">
                  Found {hospitals.length} medical facilities nearby
                </span>
                <button
                  onClick={requestLocationAndFetch}
                  className="inline-flex items-center gap-1 text-[11px] text-sapphire-600 dark:text-[#38bdf8] hover:text-sapphire-800 dark:hover:text-white hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hospitals.map((hosp, idx) => {
                  const directionsUrl = hosp.googleMapsUrl || getDirectionsUrl(hosp.name, hosp.address, hosp.lat, hosp.lng);

                  return (
                    <div
                      key={idx}
                      className="flex flex-col justify-between p-3.5 rounded-xl border border-frosted-300 dark:border-[#1e3854] bg-white dark:bg-[#102030] hover:border-sapphire-300 dark:hover:border-[#38bdf8] hover:shadow-md transition-all group"
                    >
                      <div>
                        {/* Title & Badge */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold text-sapphire-950 dark:text-[#F1F7FB] group-hover:text-sapphire-600 dark:group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                            {hosp.name}
                          </h4>
                          {hosp.isEmergency ? (
                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                              24/7 ER
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-[#38bdf8] border border-blue-200 dark:border-blue-900/60">
                              {hosp.facilityType || 'Clinic'}
                            </span>
                          )}
                        </div>

                        {/* Distance & Rating */}
                        <div className="flex items-center gap-3 text-xs text-sapphire-600 dark:text-[#82A8D2] mb-2">
                          {hosp.distanceKm !== null && hosp.distanceKm !== undefined && (
                            <span className="font-semibold text-sapphire-800 dark:text-[#F1F7FB] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-sapphire-500 dark:text-[#38bdf8]" />
                              {hosp.distanceKm} km away
                            </span>
                          )}

                          {hosp.rating && (
                            <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              {hosp.rating.toFixed(1)}
                              {hosp.userRatingsTotal ? (
                                <span className="text-[10px] text-slate-400">({hosp.userRatingsTotal})</span>
                              ) : null}
                            </span>
                          )}

                          {hosp.isOpenNow !== null && hosp.isOpenNow !== undefined && (
                            <span className={`text-[11px] font-medium ${hosp.isOpenNow ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-[#64748B]'}`}>
                              {hosp.isOpenNow ? '• Open Now' : '• Closed'}
                            </span>
                          )}
                        </div>

                        {/* Address */}
                        <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2 mb-3">
                          {hosp.address}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#192e45]">
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sapphire-600 hover:bg-sapphire-700 text-white text-xs font-semibold transition active:scale-95 shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Get Directions</span>
                        </a>

                        {hosp.phoneNumber && (
                          <a
                            href={`tel:${hosp.phoneNumber}`}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                            title={`Call ${hosp.phoneNumber}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition"
                          title="View on Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Map View */}
              <div className="mt-4 pt-3 border-t border-sapphire-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Always call 911 or your local emergency number if in life-threatening distress.</span>
                </div>
                <a
                  href={fullMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-sapphire-700 hover:text-sapphire-900 hover:underline shrink-0"
                >
                  <span>Explore all on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
