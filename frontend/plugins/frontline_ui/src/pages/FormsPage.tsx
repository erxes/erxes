import { FormsBreadCrumb } from '@/forms/components/FormsBreadCrumb';
import { FormsList } from '@/forms/components/FormsList';
import { IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button, PageContainer, Separator } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';

export const FormsPage = () => {
  const { channelId } = useParams<{ channelId: string }>();
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <FormsBreadCrumb />
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <Button className="ml-auto" asChild>
          <Link to={`/settings/frontline/forms/${channelId}/create`}>
            <IconPlus />
            Create form
          </Link>
        </Button>
      </PageHeader>
      <FormsList />
    </PageContainer>
  );
};
