import type { IStructureContact, IStructureLocation } from 'ui-modules';
import {
  IStructureContactForm,
  IStructureContactInput,
  IStructureLocationForm,
  IStructureLocationInput,
  STRUCTURE_LINK_NAMES,
  TStructureLinkName,
} from '../types/structureEntity';
import { isValidLatLng } from './parseCoordinates';

const SUMMARY_SEPARATOR = ' · ';

const toLinkValues = (
  links?: Record<string, string> | null,
): Record<TStructureLinkName, string> => ({
  website: links?.website ?? '',
  facebook: links?.facebook ?? '',
  whatsapp: links?.whatsapp ?? '',
  twitter: links?.twitter ?? '',
  youtube: links?.youtube ?? '',
});

export const toStructureLocationFormValues = (
  location?: IStructureLocation | null,
): IStructureLocationForm => {
  const latitude = location?.coordinate?.latitude;
  const longitude = location?.coordinate?.longitude;

  return {
    location: {
      address: location?.address ?? '',
      coordinate: latitude && longitude ? { latitude, longitude } : null,
      radius: location?.radius ?? 0,
    },
  };
};

export const toStructureLocationInput = ({
  location,
}: IStructureLocationForm): IStructureLocationInput => {
  const latitude = location.coordinate?.latitude;
  const longitude = location.coordinate?.longitude;

  return {
    address: location.address.trim(),
    radius: location.radius,
    ...(latitude && longitude ? { coordinate: { latitude, longitude } } : {}),
  };
};

export const toStructureContactFormValues = (
  contact?: IStructureContact | null,
): IStructureContactForm => {
  const image = contact?.image;

  return {
    contact: {
      phoneNumber: contact?.phoneNumber ?? '',
      email: contact?.email ?? '',
      links: toLinkValues(contact?.links),
      image: image
        ? {
            url: image.url,
            name: image.name,
            type: image.type,
            size: image.size,
          }
        : null,
    },
  };
};

export const toStructureContactInput = ({
  contact,
}: IStructureContactForm): IStructureContactInput => {
  const links: Partial<Record<TStructureLinkName, string>> = {};

  for (const name of STRUCTURE_LINK_NAMES) {
    const value = contact.links[name].trim();

    if (value) {
      links[name] = value;
    }
  }

  return {
    phoneNumber: contact.phoneNumber.trim(),
    email: contact.email.trim(),
    links,
    ...(contact.image ? { image: contact.image } : {}),
  };
};

export const formatStructureRadius = (meters: number) =>
  meters >= 1000 ? `${meters / 1000} km` : `${meters} m`;

const formatCoordinate = (location?: IStructureLocation | null) => {
  const lat = Number(location?.coordinate?.latitude);
  const lng = Number(location?.coordinate?.longitude);

  return location?.coordinate?.latitude &&
    location.coordinate.longitude &&
    isValidLatLng(lat, lng)
    ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    : '';
};

export const formatStructureLocationSummary = (
  location?: IStructureLocation | null,
) => {
  const place = location?.address?.trim() || formatCoordinate(location);

  if (!place) {
    return null;
  }

  return location?.radius
    ? `${place}${SUMMARY_SEPARATOR}${formatStructureRadius(location.radius)}`
    : place;
};

export const formatStructureContactSummary = (
  contact?: IStructureContact | null,
) => {
  const parts = [contact?.phoneNumber, contact?.email]
    .map((value) => value?.trim())
    .filter(Boolean);

  if (parts.length) {
    return parts.join(SUMMARY_SEPARATOR);
  }

  const link = STRUCTURE_LINK_NAMES.map((name) =>
    contact?.links?.[name]?.trim(),
  ).find(Boolean);

  return link || null;
};
