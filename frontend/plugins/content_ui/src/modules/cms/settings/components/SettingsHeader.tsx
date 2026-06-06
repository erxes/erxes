import { IconDeviceFloppy } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { PostsNavigation } from '../../posts/components/PostsNavigation';
import { type SettingsHeaderProps } from '../types/settingsTypes';

export const SettingsHeader = ({
  disabled,
  saving,
  onSave,
}: SettingsHeaderProps) => {
  return (
    <PageHeader>
      <PostsNavigation />
      <PageHeader.End>
        <Button disabled={disabled} onClick={onSave}>
          <IconDeviceFloppy />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </PageHeader.End>
    </PageHeader>
  );
};
