import { IconArrowMerge } from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';

/** The command bar's Merge: only two records at a time, as in old erxes. */
export const MergeButton = ({
  label,
  tooltip,
  disabled,
  onClick,
}: {
  label: string;
  tooltip: string;
  disabled: boolean;
  onClick: () => void;
}) => {
  const button = (
    <Button variant="secondary" disabled={disabled} onClick={onClick}>
      <IconArrowMerge />
      {label}
    </Button>
  );

  if (!disabled) return button;

  return (
    <Tooltip delayDuration={0}>
      <Tooltip.Trigger asChild>
        <div className="inline-block">{button}</div>
      </Tooltip.Trigger>
      <Tooltip.Content sideOffset={12}>
        <span>{tooltip}</span>
      </Tooltip.Content>
    </Tooltip>
  );
};

/** Tags on every one of the records (the command bar's tag picker value). */
export const commonTagIds = (records: { tagIds: string[] }[]) =>
  records.length === 0
    ? []
    : records.reduce<string[]>(
        (common, record) => common.filter((id) => record.tagIds.includes(id)),
        records[0].tagIds,
      );

/** What changed between two tag selections, for the bulk tag endpoint. */
export const tagChange = (previous: string[], next: string[]) => ({
  add: next.filter((id) => !previous.includes(id)),
  remove: previous.filter((id) => !next.includes(id)),
});
