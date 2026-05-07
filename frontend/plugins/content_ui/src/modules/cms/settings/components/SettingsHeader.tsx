import { IconDeviceFloppy } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { PostsNavigation } from '../../posts/components/PostsNavigation';

export const SettingsHeader = ({ onSave }: { onSave: () => void }) => {
  return (
    <PageHeader>
      <PostsNavigation />
      <PageHeader.End>
        <Button onClick={onSave}>
          <IconDeviceFloppy />
          Save Changes
        </Button>
      </PageHeader.End>
    </PageHeader>
  );
};
