import { IPos } from '../types/pos';

import {
  isUndefinedOrNull,
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { PosInlineProps } from '../types/pos';
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
}: PosInlineProps & {
  children?: React.ReactNode;
}) => {
  const [_pos, _setPos] = useState<IPos[]>(pos || []);

  return (
    <PosInlineContext.Provider
      value={{
        pos: pos || _pos,
        loading: false,
        posIds: posIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select pos'
          : placeholder,
        updatePos: updatePos || _setPos,
      }}
    >
      {children}
      {posIds?.map((posId) => (
        <PosInlineEffectComponent key={posId} posId={posId} />
      ))}
    </PosInlineContext.Provider>
  );
};

const PosInlineEffectComponent = ({ posId }: { posId: string }) => {
  const { pos, updatePos } = usePosInlineContext();
  const { posDetail } = usePosInline({
    variables: {
      _id: posId,
    },
  });

  useEffect(() => {
    const newPos = [...pos].filter((p) => p._id !== posId);

    if (posDetail) {
      updatePos?.([...newPos, posDetail]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posDetail]);

  return null;
};

const PosInlineTitle = () => {
  const { pos, loading, placeholder } = usePosInlineContext();

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (pos.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (pos.length < 3) {
    return <TextOverflowTooltip value={pos.map((p) => p.name).join(', ')} />;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span>{`${pos.length} pos`}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>{pos.map((p) => p.name).join(', ')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const PosInline = Object.assign(PosInlineRoot, {
  Provider: PosInlineProvider,
  Title: PosInlineTitle,
});
