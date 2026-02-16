import { PageHeader } from 'ui-modules';
import { Breadcrumb, Button, Tooltip } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { IconHierarchy2, IconInfoCircle } from '@tabler/icons-react';
import { AddPropertyGroup } from './PropertyGroupAdd';

export function PropertiesHeader() {
  const { type } = useParams<{ type: string }>();
  const guideUrl =
    'https://erxes.io/guides/68ef769c1a9ddbd30aec6c35/6992b2035cac46b2ff76b04f';
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
              <Tooltip>
                <Tooltip.Trigger>
                  <Link to={guideUrl} target="_blank">
                    <IconInfoCircle className="size-4 text-accent-foreground" />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Define custom fields and data attributes</p>
                </Tooltip.Content>
              </Tooltip>
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
