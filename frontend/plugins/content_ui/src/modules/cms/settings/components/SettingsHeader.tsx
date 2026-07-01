import { IconDeviceFloppy } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { PostsNavigation } from '../../posts/components/PostsNavigation';

export const SettingsHeader = ({
  disabled,
  saving,
  onSave,
}: {
  disabled?: boolean;
  saving?: boolean;
  onSave: () => void;
}) => {
  const { t } = useTranslation('content');
  return (
    <PageHeader>
      <PostsNavigation />
      <PageHeader.End>
        <Button disabled={disabled} onClick={onSave}>
          <IconDeviceFloppy />
          {saving ? t('saving') : t('save-changes')}
        </Button>
      </PageHeader.End>
    </PageHeader>
  );
};
