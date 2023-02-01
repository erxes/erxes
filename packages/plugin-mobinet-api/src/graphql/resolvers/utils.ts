export const findCenter = coordinates => {
  let lat = 0;
  let lng = 0;

  if (coordinates.length === 1) {
    return { lat: coordinates[0].lat, lng: coordinates[0].lng };
  }

  for (let i = 0; i < coordinates.length; ++i) {
    lat += coordinates[i].lat;
    lng += coordinates[i].lng;
  }

  lat /= coordinates.length;
  lng /= coordinates.length;

  return { lat: lat, lng: lng };
};
