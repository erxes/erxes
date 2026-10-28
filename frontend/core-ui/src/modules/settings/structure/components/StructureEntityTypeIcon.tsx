import { IconHierarchy } from '@tabler/icons-react';
import { IconComponent } from 'erxes-ui';

export const StructureEntityTypeIcon = ({
  icon,
  className,
}: {
  icon?: string | null;
  className?: string;
}) =>
  icon ? (
    <IconComponent name={icon} className={className} />
  ) : (
    <IconHierarchy className={className} />
  );
