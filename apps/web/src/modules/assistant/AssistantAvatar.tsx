import type { AssistantAppearance } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { orpc } from '~/lib/api';
import type { BloubAvatarProps } from './bloub/BloubAvatar';

const BloubAvatar = lazy(() =>
  import('./bloub/BloubAvatar').then((module) => ({ default: module.BloubAvatar })),
);

const DEFAULT_APPEARANCE: AssistantAppearance = {
  body: 'circle',
  color: 'ink',
  expression: 'neutral',
};

export const appearanceQuery = () =>
  orpc.assistant.appearance.queryOptions({ staleTime: Number.POSITIVE_INFINITY });

const useAppearance = () => useQuery(appearanceQuery()).data ?? DEFAULT_APPEARANCE;

export const AssistantAvatar = ({
  appearance,
  ...props
}: Omit<BloubAvatarProps, 'appearance'> & { appearance?: AssistantAppearance }) => {
  const mine = useAppearance();

  return (
    <Suspense
      fallback={
        <span
          aria-hidden
          className="inline-block size-(--avatar-size) shrink-0"
          style={{ '--avatar-size': `${props.size}px` }}
        />
      }
    >
      <BloubAvatar appearance={appearance ?? mine} {...props} />
    </Suspense>
  );
};
