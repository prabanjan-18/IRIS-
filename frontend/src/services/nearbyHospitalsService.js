import { API_BASE_URL } from './sendMessageToBackend';

/**
 * Service to manage browser geolocation and nearby hospital queries.
 */

export async function getUserCoordinates() {
  if (!navigator.geolocation) {
    throw new Error('NOT_SUPPORTED');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let code = 'UNKNOWN_ERROR';
        if (error.code === error.PERMISSION_DENIED) {
          code = 'PERMISSION_DENIED';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          code = 'POSITION_UNAVAILABLE';
        } else if (error.code === error.TIMEOUT) {
          code = 'TIMEOUT';
        }
        reject(new Error(code));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  });
}

export async function fetchNearbyHospitals(lat, lng, radiusMeters = 10000) {
  try {
    const url = `${API_BASE_URL}/api/nearby-hospitals?lat=${lat}&lng=${lng}&radius=${radiusMeters}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('[NearbyHospitalsService] Failed to fetch from backend, generating localized fallback:', err);
    return {
      status: 'fallback',
      count: 3,
      source: 'client_fallback',
      userLat: lat,
      userLng: lng,
      hospitals: [
        {
          name: 'Nearest Emergency Hospital',
          address: 'Emergency facilities in your area',
          googleMapsUrl: `https://www.google.com/maps/search/hospital+emergency/@${lat},${lng},14z`,
          facilityType: 'Emergency Hospital',
          isEmergency: true,
        },
        {
          name: 'Nearest Walk-in Urgent Care',
          address: 'Urgent medical care center',
          googleMapsUrl: `https://www.google.com/maps/search/urgent+care/@${lat},${lng},14z`,
          facilityType: 'Urgent Care',
          isEmergency: false,
        },
        {
          name: 'Nearby Clinics & Medical Centers',
          address: 'General healthcare providers',
          googleMapsUrl: `https://www.google.com/maps/search/medical+center/@${lat},${lng},14z`,
          facilityType: 'Medical Clinic',
          isEmergency: false,
        },
      ],
    };
  }
}

export function getDirectionsUrl(name, address, lat, lng) {
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  const query = encodeURIComponent(`${name} ${address || ''}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

const LOCATION_CACHE_KEY = 'iris_user_location';
const LOCATION_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function getCachedCoordinates() {
  try {
    const raw = sessionStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > LOCATION_CACHE_EXPIRY) {
      sessionStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }
    return parsed.coords;
  } catch (e) {
    return null;
  }
}

export function setCachedCoordinates(coords) {
  try {
    sessionStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify({ coords, timestamp: Date.now() })
    );
  } catch (e) {
    // SessionStorage may fail in private mode or quota exceeded
  }
}

export async function searchPlacesNearby({
  lat = null,
  lng = null,
  query = 'hospital',
  specialty = null,
  radius = null,
  limit = 5,
  is_emergency = false,
  area_text = null
}) {
  try {
    const url = `${API_BASE_URL}/api/places/nearby`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat,
        lng,
        query,
        specialty,
        radius,
        limit,
        is_emergency,
        area_text
      })
    });
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('[NearbyHospitalsService] searchPlacesNearby failed, generating fallback:', err);
    // Return basic structured fallback
    return {
      status: 'fallback',
      count: 1,
      source: 'client_fallback',
      center: lat && lng ? { lat, lng } : null,
      hospitals: [
        {
          name: query ? `${query.charAt(0).toUpperCase() + query.slice(1)} Near You` : 'Nearest Healthcare Facility',
          address: area_text || 'Open map to view nearby options',
          specialty: specialty || (is_emergency ? 'Emergency Care' : 'Hospital'),
          mapsUrl: lat && lng
            ? `https://www.google.com/maps/search/${encodeURIComponent(query || 'hospital')}/@${lat},${lng},14z`
            : `https://www.google.com/maps/search/${encodeURIComponent((query || 'hospital') + ' ' + (area_text || ''))}`,
          lat: lat,
          lng: lng
        }
      ]
    };
  }
}

