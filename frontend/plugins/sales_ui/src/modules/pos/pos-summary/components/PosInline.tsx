import { isUndefinedOrNull, Skeleton, Tooltip } from 'erxes-ui';
import { useEffect, useState, useMemo } from 'react';
import { PosInlineProps, IPos } from '../types/pos';
import { usePosInline } from '../hooks/usePosInline';
import {
  PosInlineContext,
  usePosInlineContext,
} from '../context/PosInlineContext';

const PosInlineRoot = (props: PosInlineProps) => {
  return (
    <PosInlineProvider {...props}>
      <PosInlineTitle />
    </PosInlineProvider>
  );
};

const PosInlineProvider = ({
  children,
  posIds,
  pos,
  placeholder,
  updatePos,
}: PosInlineProps & { children?: React.ReactNode }) => {
  const [_pos, _setPos] = useState<IPos[]>(pos || []);

  const contextValue = useMemo(() => {
    return {
      pos: pos || _pos,
      loading: false,
      posIds: posIds || [],
      placeholder: isUndefinedOrNull(placeholder) ? 'Select pos' : placeholder,
      updatePos: updatePos || _setPos,
    };
  }, [pos, _pos, posIds, placeholder, updatePos]);

  return (
    <PosInlineContext.Provider value={contextValue}>
      {children}
      {posIds?.map((posId) => (
        <PosInlineEffectComponent key={posId} posId={posId} />
      ))}
    </PosInlineContext.Provider>
  );
};

const PosInlineEffectComponent = ({ posId }: { posId: string }) => {
  const { pos, updatePos, loading } = usePosInlineContext();
  const { posDetail, loading: posLoading } = usePosInline({
    variables: { _id: posId },
  });

  useEffect(() => {
    if (posDetail && !pos?.some((p) => p._id === posDetail._id)) {
      updatePos?.([...(pos || []), posDetail]);
    }
  }, [posDetail, pos, updatePos]);

  if (loading || posLoading) {
    return <Skeleton className="w-20 h-4 inline-block" />;
  }

  return null;
};

const PosInlineTitle = () => {
  const { pos, loading, placeholder } = usePosInlineContext();

  if (loading) {
    return <Skeleton className="w-20 h-4 inline-block" />;
  }

  if (!pos || pos.length === 0) {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {pos.map((p: IPos, index: number) => (
        <div key={p._id} className="flex items-center gap-1">
          {index > 0 && <span className="text-muted-foreground">,</span>}
          <Tooltip>
            <Tooltip.Trigger asChild>
              <span className="font-medium text-sm">{p.name}</span>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>{p.name}</p>
            </Tooltip.Content>
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

export const PosInline = Object.assign(PosInlineRoot, {
  Provider: PosInlineProvider,
  Title: PosInlineTitle,
});
