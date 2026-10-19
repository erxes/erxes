import { IconCode, IconSparkles } from '@tabler/icons-react';

// Brand paths: OpenAI from simple-icons (CC0); xAI and Kimi from svgl.app.
const OPENAI_PATH =
  'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z';

const XAI_PATH =
  'm557.09 211.99 8.31 326.37h66.56l8.32-445.18zM640.28 56.91H538.72L379.35 284.53l50.78 72.52zM201.61 538.36h101.56l50.79-72.52-50.79-72.53zM201.61 211.99l228.52 326.37h101.56L303.17 211.99z';

const KIMI_TILE_PATH =
  'M503 114.333v280c0 60.711-49.29 110-110 110H113c-60.711 0-110-49.289-110-110v-280c0-60.71 49.289-110 110-110h280c60.71 0 110 49.29 110 110z';

const KIMI_ACCENT_PATH =
  'M342.065 189.759c1.886-2.42 3.541-4.63 5.289-6.77.81-1.007.74-1.771-.046-2.824-7.58-9.965-8.298-21.028-3.935-32.254 3.275-8.448 10.52-12.406 19.373-13.25 5.52-.521 10.936.046 15.959 2.73 6.596 3.53 10.438 8.912 11.688 16.341.995 5.926.81 11.712-.868 17.452-2.974 10.161-10.277 15.427-20.287 16.758-8.31 1.11-16.734 1.25-25.113 1.817-.648.046-1.308 0-2.06 0z';

const KIMI_K_PATH =
  'M321.512 144.254h-50.064l-39.637 90.384h-56.036v-89.99H131v232.868h44.787v-98.103h78.973c13.598 0 26.015-7.927 31.744-20.252v118.355h44.787v-98.103c0-23.342-18.239-42.97-41.523-44.671v-.116h-24.593a45.577 45.577 0 0026.884-24.534l29.453-65.838z';

interface IProviderIconProps {
  provider: string;
  className?: string;
  variant?: 'tile' | 'plain';
}

const MonoMark = ({
  viewBox,
  path,
  plain,
}: {
  viewBox: string;
  path: string;
  plain: boolean;
}) => (
  <svg
    viewBox={viewBox}
    className={plain ? 'size-full' : 'size-[58%]'}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

const KimiMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
    <path d={KIMI_TILE_PATH} fill="#027aff" />
    <path d={KIMI_ACCENT_PATH} fill="#fff" />
    <path d={KIMI_K_PATH} fill="#fff" />
  </svg>
);

/**
 * Brand mark for a BYOK provider value. Monochrome providers render inside
 * a subtle tile; the Kimi mark carries its own colored tile, and the
 * coding variant adds a small code badge to tell it apart from plain Kimi.
 */
export const ProviderIcon = ({
  provider,
  className = 'size-8',
  variant = 'tile',
}: IProviderIconProps) => {
  if (provider === 'openai' || provider === 'grok') {
    return (
      <span
        className={`flex shrink-0 items-center justify-center ${
          variant === 'tile' ? 'rounded-md border bg-muted/60' : ''
        } text-foreground ${className}`}
      >
        <MonoMark
          plain={variant === 'plain'}
          viewBox={provider === 'openai' ? '0 0 24 24' : '0 0 841.89 595.28'}
          path={provider === 'openai' ? OPENAI_PATH : XAI_PATH}
        />
      </span>
    );
  }

  if (provider === 'kimi' || provider === 'kimi-code') {
    return (
      <span className={`relative block shrink-0 ${className}`}>
        <KimiMark className="size-full" />
        {provider === 'kimi-code' && (
          <span className="absolute -bottom-1 -right-1 flex h-1/2 w-1/2 items-center justify-center rounded-full bg-foreground text-background">
            <IconCode className="size-[70%]" aria-hidden="true" />
          </span>
        )}
      </span>
    );
  }

  if (variant === 'plain') {
    return (
      <span
        className={`flex shrink-0 items-center justify-center text-xs font-medium uppercase text-muted-foreground ${className}`}
        aria-hidden="true"
      >
        {provider.slice(0, 1)}
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md border bg-muted/60 text-muted-foreground ${className}`}
    >
      <IconSparkles className="size-[55%]" aria-hidden="true" />
    </span>
  );
};
