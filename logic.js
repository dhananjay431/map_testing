// Function to calculate the distance between two points using Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

// Function to convert degrees to radians
function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Function to move from location A to location B
function moveLocation(latA, lonA, latB, lonB, distanceToMove) {
  const bearing = calculateBearing(latA, lonA, latB, lonB);
  const distanceInKm = distanceToMove / 1000; // Assuming distanceToMove is in meters, convert to kilometers
  const R = 6371; // Radius of the Earth in kilometers

  const lat1 = degToRad(latA);
  const lon1 = degToRad(lonA);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceInKm / R) +
      Math.cos(lat1) * Math.sin(distanceInKm / R) * Math.cos(degToRad(bearing))
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(degToRad(bearing)) * Math.sin(distanceInKm / R) * Math.cos(lat1),
      Math.cos(distanceInKm / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    latitude: radToDeg(lat2),
    longitude: radToDeg(lon2),
  };
}

// Function to calculate bearing between two points
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = degToRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(degToRad(lat2));
  const x =
    Math.cos(degToRad(lat1)) * Math.sin(degToRad(lat2)) -
    Math.sin(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.cos(dLon);

  let bearing = radToDeg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360; // Normalize the bearing to a value between 0 and 360 degrees
  return bearing;
}

// Function to convert radians to degrees
function radToDeg(radians) {
  return radians * (180 / Math.PI);
}
