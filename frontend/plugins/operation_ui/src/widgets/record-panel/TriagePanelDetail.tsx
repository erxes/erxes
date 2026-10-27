import {
  IconAlignLeft,
  IconFlag,
  IconUsersGroup,
  IconUsers,
  IconBuilding,
  IconTags,
} from '@tabler/icons-react';
import { RecordDescriptionField } from './RecordDescriptionField';
import { compactList } from '@/operation/utils/cursorList';
import { TASK_CONTENT_TYPE } from '@/task/constants';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { TeamInline } from '@/team/components/TeamInline';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { useUpdateTriage } from '@/triage/hooks/useUpdateTriage';
import {
  RecordTableInlineCell,
  ScrollArea,
  Spinner,
  TextField,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PANEL_TEXT_FIELD_CLASS_NAME, PanelField } from 'ui-modules';
import { RecordContactsField } from './RecordContactsField';

const SCOPE = 'side-panel-triage';

// A triage's fields as record table cells: click a value to edit it. It is
// accepted as a task (or declined) from the panel's top bar.
export const TriagePanelDetail = ({ triageId }: { triageId: string }) => {
  const { t } = useTranslation('operation');
  const { triage, loading } = useGetTriage(triageId);
  const { updateTriage } = useUpdateTriage();

  if (loading && !triage) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!triage) {
    return null;
  }

  const { _id, name, priority, teamId, description } = triage;
  const update = (input: {
    name?: string;
    priority?: number;
    description?: string;
    customerId?: string | null;
    companyId?: string | null;
    tagIds?: string[];
  }) =>
    updateTriage({
      variables: { _id, input },
      // Contacts' triage lists change with them.
      update: (cache) => {
        if (input.customerId !== undefined || input.companyId !== undefined) {
          cache.evict({
            id: 'ROOT_QUERY',
            fieldName: 'operationGetTriageList',
          });
        }
      },
    });

  // Radix sizes its content as a table, which lets wide values push past the
  // panel; a block lets each value shrink and truncate instead.
  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="grid gap-5 p-3 @3xl/record-panel:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/record-panel:p-6">
        <div className="flex min-w-0 flex-col gap-1">
          <PanelField icon={IconAlignLeft} label={t('name', 'Name')}>
            <TextField
              scope={`${SCOPE}.name`}
              value={name || ''}
              placeholder={t('triage-name')}
              className={PANEL_TEXT_FIELD_CLASS_NAME}
              onSave={(next) => update({ name: next })}
            />
          </PanelField>
          <PanelField icon={IconFlag} label={t('priority')}>
            <SelectPriority
              variant="table"
              scope={`${SCOPE}.priority`}
              value={priority}
              onValueChange={(next) => update({ priority: next })}
            />
          </PanelField>
          <PanelField icon={IconUsersGroup} label={t('team')} cell={false}>
            <TeamInline teamId={teamId} className="h-7 px-2 font-normal" />
          </PanelField>
          <PanelField icon={IconTags} label={t('tags')}>
            <TagsSelect.Provider
              type={TASK_CONTENT_TYPE}
              mode="multiple"
              scope={`${SCOPE}.tags`}
              value={compactList(triage.tagIds)}
              onValueChange={(tagIds) =>
                update({ tagIds: Array.isArray(tagIds) ? tagIds : [tagIds] })
              }
            >
              <RecordTableInlineCell.Trigger className="rounded-sm font-normal">
                {compactList(triage.tagIds).length ? (
                  <div className="flex min-w-0 flex-wrap gap-1">
                    <TagsSelect.SelectedList />
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {t('add-tags', 'Add tags')}
                  </span>
                )}
              </RecordTableInlineCell.Trigger>
              <RecordTableInlineCell.Content>
                <TagsSelect.Content />
              </RecordTableInlineCell.Content>
            </TagsSelect.Provider>
          </PanelField>
          <PanelField icon={IconUsers} label={t('customer', 'Customer')}>
            <RecordContactsField
              kind="customer"
              value={triage.customerId}
              scope={`${SCOPE}.customer`}
              onValueChange={(customerId) => update({ customerId })}
            />
          </PanelField>
          <PanelField icon={IconBuilding} label={t('company', 'Company')}>
            <RecordContactsField
              kind="company"
              value={triage.companyId}
              scope={`${SCOPE}.company`}
              onValueChange={(companyId) => update({ companyId })}
            />
          </PanelField>
        </div>
        <RecordDescriptionField
          key={_id}
          value={description || ''}
          onSave={(next) => update({ description: next })}
        />
      </div>
    </ScrollArea>
  );
};
