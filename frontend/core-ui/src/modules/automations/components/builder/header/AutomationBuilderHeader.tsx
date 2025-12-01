import { AutomationBuilderHeaderActions } from '@/automations/components/builder/header/AutomationBuilderHeaderActions';
import { AutomationHeaderTabs } from '@/automations/components/builder/header/AutomationHeaderTabs';
import { AutomationBuilderNameInput } from '@/automations/components/builder/header/AutomationBuilderNameInput';
import { IconAffiliate, IconSettings } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  cn,
  PageSubHeader,
  Separator,
  Spinner,
} from 'erxes-ui';
import { Link } from 'react-router';
import { PageHeader } from 'ui-modules';
import { useAutomationHeader } from '@/automations/components/builder/hooks/useAutomationHeader';

export const AutomationBuilderHeader = () => {
  const { loading, handleSubmit, handleSave, handleError, toggleTabs } =
    useAutomationHeader();
  return (
    <div>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/automations">
                    <IconAffiliate />
                    Automations
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/automations">
              <IconSettings />
              Go to settings
            </Link>
          </Button>
          <Button
            disabled={loading}
            onClick={handleSubmit(handleSave, handleError)}
          >
            {loading ? <Spinner /> : `Save`}
          </Button>
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader className={cn('flex items-center justify-between')}>
        <div className="flex items-center gap-24">
          <AutomationBuilderNameInput />
          <AutomationHeaderTabs toggleTabs={toggleTabs} />
        </div>
        <AutomationBuilderHeaderActions />
      </PageSubHeader>
    </div>
  );
};
