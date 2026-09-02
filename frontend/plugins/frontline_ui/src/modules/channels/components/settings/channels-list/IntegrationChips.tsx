import { IntegrationType } from '@/types/Integration';
import {
  FacebookIcon,
  InstagramIcon,
  MessengerIcon,
} from '@/integrations/components/Icons';
import { IconMessageFilled, IconPhone } from '@tabler/icons-react';
import type { ComponentType, CSSProperties } from 'react';

type ProviderIcon = ComponentType<{
  size?: string | number;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
}>;

const PROVIDER_META: Record<
  string,
  { Icon: ProviderIcon; iconClass?: string }
> = {
  [IntegrationType.ERXES_MESSENGER]: {
    Icon: IconMessageFilled,
    iconClass: 'text-indigo-500',
  },
  [IntegrationType.FACEBOOK_MESSENGER]: {
    Icon: MessengerIcon,
  },
  [IntegrationType.FACEBOOK_POST]: {
    Icon: FacebookIcon,
  },
  [IntegrationType.INSTAGRAM_MESSENGER]: {
    Icon: InstagramIcon,
  },
  [IntegrationType.INSTAGRAM_POST]: {
    Icon: InstagramIcon,
  },
  [IntegrationType.CALL]: {
    Icon: IconPhone,
    iconClass: 'text-emerald-500',
  },
};

const MAX_CHIPS = 5;

export const IntegrationChips = ({ kinds }: { kinds: string[] }) => {
  const counts: Record<string, number> = {};
  for (const k of kinds) {
    counts[k] = (counts[k] ?? 0) + 1;
  }

  const entries = Object.entries(counts).filter(([k]) => k in PROVIDER_META);
  const visible = entries.slice(0, MAX_CHIPS);

  const shown = visible.reduce((sum, [, count]) => sum + count, 0);
  const overflow = kinds.length - shown;

  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {visible.map(([kind, count]) => {
        const meta = PROVIDER_META[kind];
        if (!meta) return null;
        const { Icon, iconClass } = meta;
        return (
          <span
            key={kind}
            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground"
          >
            <Icon
              size={12}
              width={12}
              height={12}
              className={iconClass}
              style={{ flexShrink: 0 }}
            />
            <span className="font-medium text-foreground">{count}</span>
          </span>
        );
      })}
      {overflow > 0 && (
        <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
};
