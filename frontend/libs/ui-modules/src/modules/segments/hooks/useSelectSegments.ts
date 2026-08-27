import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { SEGMENTS } from '../graphql/queries';
import { ISegment } from '../types';

export const useSelectSegments = ({
  selected,
  exclude,
  focusOnMount,
  contentType: forContentType,
}: {
  selected?: string;
  exclude?: string[];
  focusOnMount?: boolean;
  /** Explicit type for a picker outside the segments page, which has no route. */
  contentType?: string;
}) => {
  const [search, setSearch] = useState('');
  const [routeContentType] = useQueryState<string>('contentType');
  const contentType = forContentType || routeContentType;
  const [debouncedSearch] = useDebounce(search, 500);
  const { data, loading, error } = useQuery(SEGMENTS, {
    variables: {
      contentTypes: [contentType],
      searchValue: debouncedSearch ?? undefined,
      ids: selected ? [selected] : undefined,
      excludeIds: exclude,
    },
    skip: !contentType,
  });

  const { segments = [] } = data || {};
  const selectedSegment = segments?.find(
    (segment: ISegment) => segment._id === selected,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && focusOnMount) {
      inputRef.current.focus();
    }
  }, [focusOnMount]);

  return {
    segments,
    loading,
    error,
    inputRef,
    selectedSegment,
    search,
    setSearch,
  };
};
