import { OrgLogoIcon } from '@/auth/components/Logo';
import type { NotificationIconProps } from '@/notification/types/myInbox';
import { useAtomValue } from 'jotai';
import { pluginsConfigState } from 'ui-modules';

export const NotificationIcon = ({ contentType }: NotificationIconProps) => {
  const pluginName = contentType?.split(':')[0] || '';
  const pluginMetaData = useAtomValue(pluginsConfigState)?.[pluginName + '_ui'];
  if (pluginName === 'core') {
    return <OrgLogoIcon className="size-5 text-primary" />;
  }
  const Icon = pluginMetaData?.icon;

  return Icon ? <Icon className="size-4 text-muted-foreground" /> : null;
};
