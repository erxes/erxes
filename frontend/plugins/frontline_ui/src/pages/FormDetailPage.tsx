import { FormEdit } from '@/forms/components/FormEdit';
import { FormsBreadCrumb } from '@/forms/components/FormsBreadCrumb';
import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { useState } from 'react';
import { PageHeader } from 'ui-modules';

export const FormDetailPage = () => {
  const [name, setName] = useState('');
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <FormsBreadCrumb />
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Page>
                <Button variant="ghost">{name}</Button>
              </Breadcrumb.Page>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <FormEdit setName={setName} />
    </PageContainer>
  );
};
