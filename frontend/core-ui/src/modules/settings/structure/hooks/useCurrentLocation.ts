import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TLatLng } from '../types/branchLocation';

const GEOLOCATION_OPTIONS = { enableHighAccuracy: true, timeout: 10000 };

export const useCurrentLocation = (onLocate: (place: TLatLng) => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [locating, setLocating] = useState(false);

  const fail = (description?: string) => {
    setLocating(false);
    toast({
      title: t('location-unavailable'),
      description,
      variant: 'destructive',
    });
  };

  const locate = () => {
    // Browsers only expose GPS on https or localhost
    if (!navigator.geolocation) {
      fail();
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        onLocate({ lat: coords.latitude, lng: coords.longitude });
      },
      (error) => fail(error.message),
      GEOLOCATION_OPTIONS,
    );
  };

  return { locate, locating };
};
