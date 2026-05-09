import {
  IconAt,
  IconBell,
  IconBolt,
  IconCheck,
  IconChevronRight,
  IconCloud,
  IconDeviceLaptop,
  IconHeart,
  IconHome,
  IconLink,
  IconLock,
  IconMail,
  IconMessage,
  IconPhone,
  IconPuzzle,
  IconRocket,
  IconSettings,
  IconShield,
  IconShoppingCart,
  IconStar,
  IconTrendingUp,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';

export const ICON_MAP: Record<string, React.ElementType> = {
  IconAt,
  IconBell,
  IconBolt,
  IconCheck,
  IconChevronRight,
  IconCloud,
  IconDeviceLaptop,
  IconHeart,
  IconHome,
  IconLink,
  IconLock,
  IconMail,
  IconMessage,
  IconPhone,
  IconPuzzle,
  IconRocket,
  IconSettings,
  IconShield,
  IconShoppingCart,
  IconStar,
  IconTrendingUp,
  IconUser,
  IconWorld,
};

export const ICON_OPTIONS = Object.keys(ICON_MAP).map((name) => ({
  label: name.replace(/^Icon/, ''),
  value: name,
}));

export const renderIcon = (
  name: string | undefined,
  props?: { size?: number; color?: string; className?: string },
) => {
  const Icon = name ? ICON_MAP[name] : undefined;
  if (!Icon) return null;
  return (
    <Icon
      size={props?.size ?? 24}
      color={props?.color || undefined}
      className={props?.className}
    />
  );
};
