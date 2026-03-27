import Location from "./location.model.js";

const lastSaved = new Map();

function getDistance(lat1, lon1, lat2, lon2) {
  //haversine distance formula
  const R = 6371e3;
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export const saveLocationIfNeeded = async ({ userId, lat, lng }) => {
  const now = Date.now();
  const last = lastSaved.get(userId);

  if (!last) {
    await saveLocation(userId, lat, lng);
    lastSaved.set(userId, { lat, lng, timestamp: now });
    return;
  }

  const timeDiff = now - last.timestamp;
  const distance = getDistance(last.lat, last.lng, lat, lng);

  if (timeDiff < 30000 && distance < 50) {
    return;
  }

  await saveLocation(userId, lat, lng);

  lastSaved.set(userId, { lat, lng, timestamp: now });
};

const saveLocation = async (userId, lat, lng) => {
  await Location.create({
    user: userId,
    location: {
      type: "Point",
      coordinates: [lng, lat], //geoJson
    },
  });
};
