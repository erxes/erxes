import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
  SALES_PAPA_ADDRESSES,
  SALES_PAPA_REFERENCES,
} from '../graphql/papaDocuments';
import {
  parsePapaAddresses,
  parsePapaReferences,
  TPapaAddress,
  TPapaReferences,
} from '../utils/papaJson';

const EMPTY_REFERENCES: TPapaReferences = {
  locations: [],
  categories: [],
  conditions: [],
};

/** Papa's districts, categories and conditions (cached by the Sales API). */
export const usePapaReferences = (skip = false) => {
  const { data, loading, error } = useQuery(SALES_PAPA_REFERENCES, { skip });

  const references = useMemo(() => {
    try {
      return parsePapaReferences(data?.salesPapaReferences);
    } catch {
      return EMPTY_REFERENCES;
    }
  }, [data?.salesPapaReferences]);

  return { references, loading, error };
};

export const usePapaAddresses = (skip = false) => {
  const { data, loading, error } = useQuery(SALES_PAPA_ADDRESSES, { skip });

  const addresses = useMemo<TPapaAddress[]>(() => {
    try {
      return parsePapaAddresses(data?.salesPapaAddresses);
    } catch {
      return [];
    }
  }, [data?.salesPapaAddresses]);

  return { addresses, loading, error };
};
