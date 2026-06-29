import { IconChartPie } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';

export const LogsBreadcrumb = () => {
  return (
    <PageHeader className="p-3 mx-0" separatorClassName="mb-0">
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost">
                <IconChartPie className="w-5 h-5" />
                System Logs
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
      </PageHeader.Start>
    </PageHeader>
  );
};
