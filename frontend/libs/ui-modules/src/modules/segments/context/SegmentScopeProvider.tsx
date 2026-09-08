import { createContext, useContext, useMemo } from 'react';
import { TNodePath } from '../types';
import { useSegment } from './SegmentProvider';

export type TSegmentScope = {
  contentType: string;
  nested: boolean;
  sortable: boolean;
  onEnterGroup?: (path: TNodePath) => void;
};

const SegmentScopeContext = createContext<TSegmentScope | null>(null);

export const SegmentScopeProvider = ({
  children,
  contentType,
  nested = false,
  sortable = !nested,
  onEnterGroup,
}: {
  children: React.ReactNode;
  contentType?: string;
  nested?: boolean;
  sortable?: boolean;
  onEnterGroup?: (path: TNodePath) => void;
}) => {
  const { contentType: segmentType } = useSegment();
  const resolved = contentType || segmentType;

  const value = useMemo(
    () => ({ contentType: resolved, nested, sortable, onEnterGroup }),
    [resolved, nested, sortable, onEnterGroup],
  );

  return (
    <SegmentScopeContext.Provider value={value}>
      {children}
    </SegmentScopeContext.Provider>
  );
};

export const useSegmentScope = () => {
  const scope = useContext(SegmentScopeContext);

  if (!scope) {
    throw new Error(
      'useSegmentScope must be used inside a SegmentScopeProvider',
    );
  }

  return scope;
};
