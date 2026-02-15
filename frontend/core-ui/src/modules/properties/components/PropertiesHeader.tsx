import { PageHeader } from 'ui-modules';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { IconHierarchy2, IconInfoCircle } from '@tabler/icons-react';
import { AddPropertyGroup } from './PropertyGroupAdd';

export function PropertiesHeader() {
  const { type } = useParams<{ type: string }>();
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/settings/properties">
                  <IconHierarchy2 />
                  Properties
                </Link>
              </Button>
              <IconInfoCircle className="size-4 text-accent-foreground" />
            </Breadcrumb.Item>
            {type && <Breadcrumb.Separator />}
            {type && (
              <Breadcrumb.Item>
                <Button variant="ghost" asChild className="capitalize">
                  <Link to={`/settings/properties?type=${type}`}>
                    {type.replace(':', ' ')} properties
                  </Link>
                </Button>
              </Breadcrumb.Item>
            )}
          </Breadcrumb.List>
        </Breadcrumb>
      </PageHeader.Start>
      <PageHeader.End>
        <AddPropertyGroup />
      </PageHeader.End>
    </PageHeader>
  );
}
