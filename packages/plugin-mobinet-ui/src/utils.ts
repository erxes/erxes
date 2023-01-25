import { ICoordinates } from './types';
export const submenu = [
  { title: 'Buildings', link: '/mobinet/building/list' },
  { title: 'Quarters', link: '/mobinet/quarter/list' },
  { title: 'Districts', link: '/mobinet/district/list' },
  { title: 'Cities', link: '/mobinet/city/list' }
];

export const getGqlString = doc => {
  return doc.loc && doc.loc.source.body;
};

export const findCenter = (coordinates: ICoordinates[]) => {
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
