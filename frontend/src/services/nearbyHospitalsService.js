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
