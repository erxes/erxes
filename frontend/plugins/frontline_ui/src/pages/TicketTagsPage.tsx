import { PageSubHeader } from 'erxes-ui';
import { TagsSettingFilter } from '@/ticket/components/tags/components/TagsSettingFilter';
import { TagsRecordTable } from '@/ticket/components/tags/components/TagsRecordTable';
import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { Button } from 'erxes-ui';
import { IconChecklist } from '@tabler/icons-react';
import { TagProvider } from '@/ticket/components/tags/providers/TagProvider';
import { TagsGroupsAddButtons } from '@/ticket/components/tags/components/TagsGroupsAddButtons';

export const TicketTagsPage = () => {
  return (
    <TagProvider>
      <PageContainer>
        <SettingsHeader
          breadcrumbs={
            <Button variant="ghost" className="font-semibold">
              <IconChecklist className="w-4 h-4 text-accent-foreground" />
              Ticket Tags
            </Button>
          }
        >
          <div className="ml-auto">
            <TagsGroupsAddButtons />
          </div>
        </SettingsHeader>
        <div className="flex flex-auto overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden flex-1">
            <PageSubHeader>
              <TagsSettingFilter />
            </PageSubHeader>
            <TagsRecordTable tagType="frontline:ticket" />
          </div>
        </div>
      </PageContainer>
    </TagProvider>
  );
};
