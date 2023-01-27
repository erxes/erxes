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

export const getBuildingColor = (serviceStatus: string) => {
  switch (serviceStatus) {
    case 'active':
      return '#006400';
    case 'inprogress':
      return '#ffff00';
    default:
      return '#ff0000';
  }
};

export const renderCompanyName = data => {
  if (data.primaryName || data.primaryPhone || data.primaryEmail) {
    console.log('data.primaryName', data.primaryName);
    return (
      (data.primaryName || '') +
      ' ' +
      (data.primaryEmail || '') +
      ' ' +
      (data.primaryPhone || '')
    );
  }

  if (data.primaryEmail || data.primaryPhone) {
    return data.primaryEmail || data.primaryPhone;
  }

  if (data.emails && data.emails.length > 0) {
    return data.emails[0] || 'Unknown';
  }

  return 'Unknown';
};
