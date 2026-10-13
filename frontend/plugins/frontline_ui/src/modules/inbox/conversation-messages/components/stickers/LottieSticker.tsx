import { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';
import { Skeleton } from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { GET_DISCORD_STICKER_ANIMATION } from '@/inbox/conversation-messages/graphql/queries/getDiscordStickerAnimation';

export const LottieSticker = ({
  stickerId,
  name,
  onError,
}: {
  stickerId: string;
  name: string;
  onError: (reason?: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const { data, error } = useQuery<{
    discordStickerAnimation: Record<string, unknown>;
  }>(GET_DISCORD_STICKER_ANIMATION, { variables: { stickerId } });
  const animationData = data?.discordStickerAnimation;

  useEffect(() => {
    if (error) onError('Unable to load Discord sticker');
  }, [error, onError]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !animationData) return undefined;
    let cancelled = false;
    let animation: AnimationItem | undefined;
    setLoading(true);
    const fail = (error?: unknown) => {
      if (!cancelled) {
        onError(
          error instanceof Error ? error.message : 'Unable to render sticker',
        );
      }
    };

    import('lottie-web/build/player/lottie_light')
      .then(({ default: lottie }) => {
        if (cancelled) return;
        const reducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;
        animation = lottie.loadAnimation({
          container,
          renderer: 'svg',
          animationData: JSON.parse(JSON.stringify(animationData)),
          loop: !reducedMotion,
          autoplay: !reducedMotion,
        });
        animation.addEventListener('data_failed', fail);
        animation.addEventListener('error', fail);
        animation.addEventListener('DOMLoaded', () => {
          if (!cancelled) setLoading(false);
        });
      })
      .catch(fail);

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, [animationData, onError]);

  return (
    <div
      className="relative size-40"
      role="img"
      aria-label={name}
      aria-busy={loading}
    >
      {loading && (
        <Skeleton className="absolute inset-0 size-full rounded-lg" />
      )}
      <div ref={containerRef} className="size-full" />
    </div>
  );
};
