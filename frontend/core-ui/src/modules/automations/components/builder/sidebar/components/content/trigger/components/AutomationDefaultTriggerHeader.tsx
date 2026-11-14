import { NodeData } from '@/automations/types';
import { IconSettings } from '@tabler/icons-react';
import { Button, Checkbox, Label, Popover, Select, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  useAutomationDefaultTriggerHeader,
  useAutomationTriggerReEnrollment,
  useReEnrollmentRelationLabel,
} from '../hooks/useAutomationDefaultTriggerHeader';
import {
  ReEnrollmentOption,
  ReEnrollmentRelation,
} from '../hooks/useReEnrollmentRules';

export const AutomationDefaultTriggerHeader = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const { t } = useTranslation('automations');
  const { recordType, contentId, showReEnrollment, onRecordTypeChange } =
    useAutomationDefaultTriggerHeader(activeNode);

  return (
    <div className="p-2 flex flex-row justify-between items-center gap-2">
      <Select value={recordType} onValueChange={onRecordTypeChange}>
        <Select.Trigger>
          <Select.Value placeholder={t('sidebar-records-every')} />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="every">{t('sidebar-records-every')}</Select.Item>
          <Select.Item value="new">{t('sidebar-records-new')}</Select.Item>
          <Select.Item value="existing">
            {t('sidebar-records-existing')}
          </Select.Item>
        </Select.Content>
      </Select>
      {showReEnrollment && (
        <AutomationTriggerReEnrollmentPopover
          activeNode={activeNode}
          contentId={contentId}
        />
      )}
    </div>
  );
};

const AutomationTriggerReEnrollmentPopover = ({
  activeNode,
  contentId,
}: {
  activeNode: NodeData;
  contentId: string;
}) => {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon">
          <IconSettings />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-92">
        <AutomationTriggerReEnrollmentPopoverContent
          activeNode={activeNode}
          contentId={contentId}
        />
      </Popover.Content>
    </Popover>
  );
};

const AutomationTriggerReEnrollmentPopoverContent = ({
  activeNode,
  contentId,
}: {
  activeNode: NodeData;
  contentId: string;
}) => {
  const { t } = useTranslation('automations');
  const { loading, hintKey, options } = useAutomationTriggerReEnrollment(
    activeNode,
    contentId,
  );

  if (loading) {
    return <Skeleton className="size-10" />;
  }

  return (
    <div className="flex flex-col gap-2">
      <b>{t('re-enrollment')}</b>
      <p className="text-sm text-muted-foreground">{t(hintKey)}</p>
      {options.map(({ option, id, checked, toggle }) => (
        <div key={option.propertyName} className="flex items-center gap-2">
          <Checkbox id={id} checked={checked} onCheckedChange={toggle} />
          <Label htmlFor={id}>
            <ReEnrollmentOptionLabel option={option} />
          </Label>
        </div>
      ))}
    </div>
  );
};

const ReEnrollmentRelationLabel = ({
  relation,
}: {
  relation: ReEnrollmentRelation;
}) => <>{useReEnrollmentRelationLabel(relation)}</>;

const ReEnrollmentOptionLabel = ({ option }: { option: ReEnrollmentOption }) =>
  option.relation ? (
    <ReEnrollmentRelationLabel relation={option.relation} />
  ) : (
    <>{option.label}</>
  );
