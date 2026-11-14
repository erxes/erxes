import { Empty } from 'erxes-ui';
import { IconClipboardList } from '@tabler/icons-react';

export const SettingsEmptyState = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <Empty className="absolute inset-0 border-0 bg-transparent">
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconClipboardList />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      {description && <Empty.Description>{description}</Empty.Description>}
    </Empty.Header>
  </Empty>
);
