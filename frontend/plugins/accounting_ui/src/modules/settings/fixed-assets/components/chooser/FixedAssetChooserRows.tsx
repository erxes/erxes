import { KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconChevronDown,
  IconChevronRight,
  IconCornerDownRight,
  IconX,
} from '@tabler/icons-react';
import { Button, Checkbox, Table } from 'erxes-ui';
import { BranchBadge, DepartmentBadge } from 'ui-modules';
import {
  TChooserItem,
  TFixedAssetChoice,
  fixedAssetChoiceKey,
} from '@/settings/fixed-assets/components/chooser/types';
import { fxaGroupChoices } from '@/settings/fixed-assets/components/chooser/selection';

const activateRow = (
  event: KeyboardEvent<HTMLTableRowElement>,
  action: () => void,
) => {
  if (
    event.target !== event.currentTarget ||
    !['Enter', ' '].includes(event.key)
  )
    return;
  event.preventDefault();
  action();
};

const AssetName = ({ choice }: { choice: TFixedAssetChoice }) => (
  <span
    className="block min-w-0 truncate text-xs"
    title={`${choice.asset.code} - ${choice.asset.name}`}
  >
    <span className="font-mono text-muted-foreground">{choice.asset.code}</span>
    {' - '}
    {choice.asset.name}
  </span>
);

const ChoiceLocationCells = ({ choice }: { choice: TFixedAssetChoice }) => {
  const { t } = useTranslation('accounting');
  const branch = choice.location?.branchId ? (
    <BranchBadge branchId={choice.location.branchId} renderAsPlainText />
  ) : (
    t('fxa-chooser-unassigned-branch')
  );
  const department = choice.location?.departmentId ? (
    <DepartmentBadge
      departmentId={choice.location.departmentId}
      renderAsPlainText
    />
  ) : (
    t('fxa-chooser-unassigned-department')
  );
  return (
    <>
      <Table.Cell className="px-2 py-1 text-xs">
        {choice.location ? branch : t('fxa-chooser-all-locations')}
      </Table.Cell>
      <Table.Cell className="px-2 py-1 text-xs">
        {choice.location ? department : '-'}
      </Table.Cell>
      <Table.Cell className="px-2 py-1 text-right text-xs tabular-nums">
        {choice.location?.remainder.toLocaleString() ?? '-'}
      </Table.Cell>
      <Table.Cell className="px-2 py-1 text-right text-xs tabular-nums">
        {choice.asset.originalCost?.toLocaleString() ?? '-'}
      </Table.Cell>
    </>
  );
};

export const FixedAssetChooserHeader = () => {
  const { t } = useTranslation('accounting');
  return (
    <Table.Header className="sticky top-0 z-10">
      <Table.Row>
        <Table.Head className="w-8" />
        <Table.Head className="w-[32%]">{t('fixed-asset')}</Table.Head>
        <Table.Head>{t('branch')}</Table.Head>
        <Table.Head>{t('department')}</Table.Head>
        <Table.Head className="text-right">
          {t('fxa-chooser-available-quantity')}
        </Table.Head>
        <Table.Head className="text-right">{t('unit-price')}</Table.Head>
      </Table.Row>
    </Table.Header>
  );
};

export const FixedAssetChooserRows = ({
  item,
  allLocations,
  assetScoped,
  selections,
  choose,
}: {
  item: TChooserItem;
  allLocations: boolean;
  assetScoped: boolean;
  selections: TFixedAssetChoice[];
  choose: (choices: TFixedAssetChoice[]) => void;
}) => {
  const { t } = useTranslation('accounting');
  const [expanded, setExpanded] = useState(true);
  const group = fxaGroupChoices(item, selections, assetScoped, allLocations);
  const chooseGroup = () => {
    if (item.asset._id && group.length) choose(group);
  };
  const leaf = (choice: TFixedAssetChoice) => {
    const select = () => choose([choice]);
    return (
      <Table.Row
        key={fixedAssetChoiceKey(choice)}
        tabIndex={0}
        aria-selected={false}
        className="h-8 cursor-pointer hover:bg-accent"
        onClick={select}
        onKeyDown={(event) => activateRow(event, select)}
      >
        <Table.Cell
          className="w-8 p-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={false}
            onCheckedChange={select}
            aria-label={`${t('fixed-asset')}: ${choice.asset.code}, ${
              choice.location?.branchId || '-'
            }, ${choice.location?.departmentId || '-'}`}
          />
        </Table.Cell>
        <Table.Cell className="max-w-0 px-2 py-1">
          <span className="flex min-w-0 items-center gap-1.5 pl-2 font-mono text-xs text-muted-foreground">
            <IconCornerDownRight className="size-3.5 shrink-0" />
            <span className="truncate">{choice.asset.code}</span>
          </span>
        </Table.Cell>
        <ChoiceLocationCells choice={choice} />
      </Table.Row>
    );
  };
  return (
    <>
      <Table.Row
        tabIndex={0}
        aria-selected={false}
        onClick={chooseGroup}
        onKeyDown={(event) => activateRow(event, chooseGroup)}
        className="h-8 cursor-pointer [&>td]:bg-sidebar"
      >
        <Table.Cell
          className="w-8 p-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={
              selections.some((choice) => choice.asset._id === item.asset._id)
                ? 'indeterminate'
                : false
            }
            disabled={!group.length || !item.asset._id}
            onCheckedChange={chooseGroup}
            aria-label={`${t('fixed-asset')}: ${item.asset.code}`}
          />
        </Table.Cell>
        <Table.Cell className="max-w-0 px-2 py-1">
          <div className="flex items-center gap-1 min-w-0 font-medium">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              aria-expanded={expanded}
              aria-label={`${item.asset.code} ${t('fxa-chooser-locations', {
                count: item.locations.length,
              })}`}
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((value) => !value);
              }}
            >
              {expanded ? (
                <IconChevronDown className="size-3.5" />
              ) : (
                <IconChevronRight className="size-3.5" />
              )}
            </Button>
            <AssetName choice={{ asset: item.asset }} />
          </div>
        </Table.Cell>
        <Table.Cell
          colSpan={2}
          className="px-2 py-1 text-xs text-muted-foreground"
        >
          {t('fxa-chooser-locations', { count: item.locations.length })}
        </Table.Cell>
        <Table.Cell className="px-2 py-1 text-xs text-right tabular-nums">
          {item.locations
            .reduce((sum, location) => sum + location.remainder, 0)
            .toLocaleString()}
        </Table.Cell>
        <Table.Cell className="px-2 py-1 text-xs text-right tabular-nums">
          {item.asset.originalCost?.toLocaleString() ?? '-'}
        </Table.Cell>
      </Table.Row>
      {expanded &&
        item.locations.map((location) =>
          allLocations ? (
            <Table.Row
              key={JSON.stringify([location.branchId, location.departmentId])}
              className="h-8"
            >
              <Table.Cell />
              <Table.Cell className="max-w-0 px-2 py-1">
                <span className="flex min-w-0 items-center gap-1.5 pl-2 font-mono text-xs text-muted-foreground">
                  <IconCornerDownRight className="size-3.5 shrink-0" />
                  <span className="truncate">{item.asset.code}</span>
                </span>
              </Table.Cell>
              <ChoiceLocationCells choice={{ asset: item.asset, location }} />
            </Table.Row>
          ) : (
            leaf({ asset: item.asset, location })
          ),
        )}
    </>
  );
};

export const FixedAssetChosenRows = ({
  choices,
  remove,
}: {
  choices: TFixedAssetChoice[];
  remove: (choice: TFixedAssetChoice) => void;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <>
      {choices.map((choice) => (
        <Table.Row
          key={fixedAssetChoiceKey(choice)}
          tabIndex={0}
          aria-selected
          onClick={() => remove(choice)}
          onKeyDown={(event) => activateRow(event, () => remove(choice))}
          className="h-8 cursor-pointer hover:bg-accent"
        >
          <Table.Cell className="w-8 p-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={`${t('remove-selected')}: ${choice.asset.code}`}
              onClick={(event) => {
                event.stopPropagation();
                remove(choice);
              }}
            >
              <IconX className="size-3.5" />
            </Button>
          </Table.Cell>
          <Table.Cell className="max-w-0 px-2 py-1">
            <AssetName choice={choice} />
          </Table.Cell>
          <ChoiceLocationCells choice={choice} />
        </Table.Row>
      ))}
    </>
  );
};
