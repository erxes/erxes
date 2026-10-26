import { OrgLogoIcon } from '@/auth/components/Logo';
import type { NotificationIconProps } from '@/notification/types/myInbox';
import { IconBell } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { pluginsConfigState } from 'ui-modules';

export const NotificationIcon = ({ contentType }: NotificationIconProps) => {
  const pluginName = contentType?.split(/[:.]/)[0] || 'core';
  const pluginMetaData = useAtomValue(pluginsConfigState)?.[pluginName + '_ui'];
  if (pluginName === 'core') {
    return <OrgLogoIcon className="size-5" />;
  }
  const Icon =
    pluginMetaData?.navigationGroup?.icon ||
    pluginMetaData?.icon ||
    pluginMetaData?.modules?.[0]?.icon;

  return Icon ? <Icon className="size-4" /> : <IconBell className="size-4" />;
};
