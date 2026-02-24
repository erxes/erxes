import { FormsBreadCrumb } from '@/forms/components/FormsBreadCrumb';
import { FormsList } from '@/forms/components/FormsList';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { SettingsHeader } from 'ui-modules';

export const FormsPage = () => {
  const { channelId } = useParams<{ channelId: string }>();
  return (
    <>
      <SettingsHeader>
        <FormsBreadCrumb />
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
