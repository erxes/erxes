import { FormsList } from '@/forms/components/FormsList';
import { IconForms, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { SettingsHeader } from 'ui-modules';

export const FormsPage = () => {
  const { channelId } = useParams<{ channelId: string }>();
  return (
    <>
      <SettingsHeader>
        <Button variant="ghost" className="font-semibold">
          <IconForms />
          Forms
        </Button>
        <Button className="ml-auto" asChild>
          <Link to={`/settings/frontline/forms/${channelId}/create`}>
            <IconPlus />
            Create form
          </Link>
        </Button>
      </SettingsHeader>
      <FormsList />
    </>
  );
};
