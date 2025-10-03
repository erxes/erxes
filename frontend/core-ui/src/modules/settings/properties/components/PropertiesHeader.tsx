import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { Breadcrumb, Button, useQueryState } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconTools } from '@tabler/icons-react';
import { PropertiesCommandMenuTrigger } from '@/settings/properties/components/add/PropertiesCommandMenuTrigger';

export function PropertiesHeader() {
  const [type] = useQueryState<string>('type');
  return (
    <PageHeader>
      <PageHeaderStart>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/properties">
                  <IconTools />
                  Properties
                </Link>
              </Button>
            </Breadcrumb.Item>
            {type && <Breadcrumb.Separator />}
            {type && (
              <Breadcrumb.Item>
                <Button variant="ghost" asChild className="capitalize">
                  <Link to={`/settings/properties?type=${type}`}>
                    {type} properties
                  </Link>
                </Button>
              </Breadcrumb.Item>
            )}
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeaderStart>
      <PageHeaderEnd>
        <PropertiesCommandMenuTrigger />
      </PageHeaderEnd>
    </PageHeader>
  );
}
