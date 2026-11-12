import { toast } from 'erxes-ui';
import { LatLngLiteral } from 'leaflet';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

// Nominatim's usage policy forbids search-as-you-type: one request per click.
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

const nominatimPlacesSchema = z.array(
  z.object({ lat: z.string(), lon: z.string() }).passthrough(),
);

const findPlace = async (
  query: string,
  language: string,
): Promise<LatLngLiteral | null> => {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'mn',
    'accept-language': language || 'mn',
  });
  const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params}`);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const [place] = nominatimPlacesSchema.parse(await response.json());

  return place ? { lat: Number(place.lat), lng: Number(place.lon) } : null;
};

/** Looks an address up on OpenStreetMap, limited to Mongolia. */
export const usePapaAddressSearch = (
  onFound: (place: LatLngLiteral) => void,
) => {
  const { t, i18n } = useTranslation('sales');
  const [searching, setSearching] = useState(false);

  const search = async (address: string) => {
    const query = address.trim();

    if (!query) {
      return;
    }

    setSearching(true);

    try {
      // Checkout addresses end in free text ("5-р байр 12 тоот") that maps
      // rarely know; on a miss, retry once without the last part.
      const parts = query
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
      const queries = [query];

      if (parts.length > 2) {
        queries.push(parts.slice(0, -1).join(', '));
      }

      for (const [index, text] of queries.entries()) {
        if (index > 0) {
          // Nominatim allows at most one request per second.
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const place = await findPlace(text, i18n.language);

        if (place) {
          onFound(place);
          return;
        }
      }

      toast({
        title: t(
          'papa-address-not-found',
          'Address not found on the map; click the spot instead',
        ),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  return { search, searching };
};
