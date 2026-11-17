import { AutomationsHotKeyScope } from '@/automations/types';
import { useAutomationRecordTableCommandBar } from '@/automations/hooks/useAutomationRecordTableCommandBar';
import { CommandBar, Separator } from 'erxes-ui';
import { AutomationRemoveButtonCommandBar } from '@/automations/components/list/AutomationRemoveButtonCommandBar';
import { AutomationMoveToFolderCommandBar } from '@/automations/components/list/folders/AutomationMoveToFolderCommandBar';
import { Can, TagsSelect } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AutomationRecordTableCommandBar = () => {
  const { t } = useTranslation('automations');
  const {
    selectedRows,
    selectedCount,
    isSelected,
    automationIds,
    tagIds,
    tagOptions,
  } = useAutomationRecordTableCommandBar();

  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('list-selected-count', { count: selectedCount })}
        </CommandBar.Value>
        <Can action="tagsTag">
          <>
            <Separator.Inline />
            <TagsSelect
              scope={AutomationsHotKeyScope.AutomationsTableInlinePopover}
              type="core:automation"
              mode="multiple"
              variant="secondary"
              className="shadow-none"
              value={tagIds}
              targetIds={automationIds}
              options={tagOptions}
            />
          </>
        </Can>
        <Can action="automationsUpdate">
          <>
            <Separator.Inline />
            <AutomationMoveToFolderCommandBar rows={selectedRows} />
          </>
        </Can>
        <Can action="automationsDelete">
          <>
            <Separator.Inline />
            <AutomationRemoveButtonCommandBar
              automationIds={automationIds}
              rows={selectedRows}
            />
          </>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
