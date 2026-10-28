import { toast } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NOMINATIM_SEARCH_URL } from '../constants/structureLocation';
import { TLatLng, TLocationSearchResult } from '../types/structureLocation';
import { isShortMapLink, parseCoordinates } from '../utils/parseCoordinates';

type TNominatimPlace = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export const useLocationSearch = (onPick: (place: TLatLng) => void) => {
  const { t, i18n } = useTranslation('settings', { keyPrefix: 'structure' });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TLocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const pasted = useMemo(() => parseCoordinates(query), [query]);

  const pick = (place: TLatLng) => {
    onPick(place);
    setResults([]);
    setQuery('');
  };

  const search = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'jsonv2',
        limit: '5',
        'accept-language': i18n.language,
      });
      const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params}`);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const places: TNominatimPlace[] = await response.json();

      setResults(
        places.map((place) => ({
          id: place.place_id,
          label: place.display_name,
          lat: Number(place.lat),
          lng: Number(place.lon),
        })),
      );

      if (!places.length) {
        toast({ title: t('location-not-found') });
      }
    } catch (error) {
      toast({
        title: t('location-search-failed'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (pasted) {
      pick(pasted);
      return;
    }

    if (isShortMapLink(query)) {
      toast({ title: t('short-map-link'), variant: 'destructive' });
      return;
    }

    if (query.trim()) {
      search();
    }
  };

  return { query, setQuery, results, loading, pasted, submit, pick };
};
