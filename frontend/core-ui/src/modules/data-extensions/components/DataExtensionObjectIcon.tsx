import {
  IconBox,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCar,
  IconCertificate,
  IconClipboard,
  IconCoin,
  IconFileText,
  IconHeart,
  IconHome,
  IconMapPin,
  IconPackage,
  IconSchool,
  IconShield,
  IconStar,
  IconTicket,
  IconTool,
  IconTruck,
  IconUsers,
  TablerIcon,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { DataExtensionObjectIcon as ObjectIconName } from 'ui-modules';

export const OBJECT_ICONS: Record<ObjectIconName, TablerIcon> = {
  box: IconBox,
  'file-text': IconFileText,
  briefcase: IconBriefcase,
  building: IconBuilding,
  home: IconHome,
  car: IconCar,
  calendar: IconCalendar,
  certificate: IconCertificate,
  clipboard: IconClipboard,
  coin: IconCoin,
  heart: IconHeart,
  'map-pin': IconMapPin,
  package: IconPackage,
  school: IconSchool,
  shield: IconShield,
  star: IconStar,
  ticket: IconTicket,
  tool: IconTool,
  truck: IconTruck,
  users: IconUsers,
};

export const DataExtensionObjectIcon = ({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) => {
  const Icon = OBJECT_ICONS[icon as ObjectIconName] || IconBox;

  return <Icon aria-hidden="true" className={cn('size-4 shrink-0', className)} />;
};
