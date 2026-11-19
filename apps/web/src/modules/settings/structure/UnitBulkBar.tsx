import type { UnitNode } from '@erxes/core-contract';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { IconTrash } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, CommandBar, Separator, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from './context';
import { ancestorIds, isWithin } from './unitTree';
import { UnitPicker } from './UnitPicker';
import { useStructureHandlers } from './useStructureHandlers';

type Failure = { unit: UnitNode; error: unknown };

/** Runs `run` on each unit, one after the other; the units it failed on come back. */
const inTurn = (units: UnitNode[], run: (unit: UnitNode) => Promise<unknown>) =>
  units.reduce<Promise<Failure[]>>(
    (earlier, unit) =>
      earlier.then((failed) =>
        run(unit).then(
          () => failed,
          (error: unknown) => [...failed, { unit, error }],
        ),
      ),
    Promise.resolve([]),
  );

/** The picked units no other picked unit holds: moving those moves the rest along. */
const topmost = (units: UnitNode[]) => {
  const kept: UnitNode[] = [];

  for (const unit of units.toSorted((a, b) => (a.path < b.path ? -1 : 1))) {
    const last = kept.at(-1);

    if (!last || !isWithin(unit, last)) kept.push(unit);
  }

  return kept;
};

const namesOf = (failed: Failure[]) => failed.map(({ unit }) => unit.name).join(', ');

/**
 * What ends a bulk action: the units load again, the picked ones are dropped, and a toast names
 * the units it left out and why the first one was.
 */
const useFinish = () => {
  const { toast } = useToast();
  const { resetPicked } = useWorkspace();
  const refresh = useStructureHandlers<null>().onSuccess;

  return (title: string, failed: Failure[]) => {
    refresh(null);
    resetPicked();

    if (failed.length)
      toast({
        variant: 'destructive',
        title,
        description: `${namesOf(failed)}. ${messageOf(failed[0]?.error)}`,
      });
  };
};

/**
 * Deletes the picked units, the deepest first, so a unit whose subunits are all picked goes too.
 * The ones that still hold something can be turned off instead.
 */
const useBulkRemove = (units: UnitNode[]) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { confirm } = useConfirm();
  const finish = useFinish();
  const remove = useMutation(orpc.units.remove.mutationOptions());
  const save = useMutation(orpc.units.update.mutationOptions());

  const turnOff = async (kept: Failure[]) => {
    await confirm({
      message: t('still-hold-count', {
        count: kept.length,
        defaultValue_one: '{{count}} unit still holds something',
        defaultValue_other: '{{count}} units still hold something',
      }),
      options: {
        description: t(
          'still-hold-hint',
          'Kept, with subunits, members or API keys that name them: {{names}}. Turn them off instead: they leave the chart, and records keep them.',
          { names: namesOf(kept) },
        ),
        okLabel: t('turn-them-off', 'Turn them off'),
      },
    });

    finish(
      t('turn-off-failed', 'Some units could not be turned off'),
      await inTurn(
        kept.map(({ unit }) => unit),
        (unit) => save.mutateAsync({ id: unit.id, isActive: false }),
      ),
    );
  };

  return async () => {
    await confirm({
      message: t('delete-count-confirm', {
        count: units.length,
        defaultValue_one: 'Delete {{count}} unit?',
        defaultValue_other: 'Delete {{count}} units?',
      }),
      options: {
        description: t(
          'delete-count-hint',
          'Only units nothing is in are deleted. You can turn the others off after.',
        ),
        okLabel: t('delete', 'Delete'),
        variants: { ok: 'destructive' },
      },
    });

    const failed = await inTurn(
      units.toSorted((a, b) => ancestorIds(b).length - ancestorIds(a).length),
      (unit) => remove.mutateAsync({ id: unit.id }),
    );

    const kept = failed.filter(({ error }) => isApiError(error, 'UNIT_NOT_EMPTY'));

    finish(
      t('delete-failed', 'Some units could not be deleted'),
      failed.filter((failure) => !kept.includes(failure)),
    );

    if (kept.length) await turnOff(kept);
  };
};

/** Moves the picked units, with everything under them, under another unit, after asking. */
const useBulkMove = (units: UnitNode[]) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { confirm } = useConfirm();
  const finish = useFinish();
  const move = useMutation(orpc.units.move.mutationOptions());

  return async (parent: UnitNode) => {
    const moving = topmost(units).filter((unit) => unit.parentId !== parent.id);

    if (moving.length)
      await confirm({
        message: t('move-count-confirm', {
          count: moving.length,
          parent: parent.name,
          defaultValue_one: 'Move {{count}} unit under {{parent}}?',
          defaultValue_other: 'Move {{count}} units under {{parent}}?',
        }),
        options: {
          description: t(
            'move-count-hint',
            'Everything under them moves along. Members with them: {{members}}. Who can reach their records may change, since supervisors see the units under theirs.',
            { members: moving.reduce((sum, unit) => sum + unit.subtreeMemberCount, 0) },
          ),
          okLabel: t('move', 'Move'),
        },
      });

    finish(
      t('move-failed', 'Some units could not be moved'),
      await inTurn(moving, (unit) =>
        move.mutateAsync({ id: unit.id, parentId: parent.parentId ? parent.id : null }),
      ),
    );
  };
};

const Actions = ({ units }: { units: UnitNode[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { resetPicked } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const remove = useBulkRemove(units);
  const move = useBulkMove(units);

  const run = (action: Promise<void>) => {
    setBusy(true);
    void action.finally(() => setBusy(false));
  };

  return (
    <CommandBar.Bar>
      <CommandBar.Value onClose={() => resetPicked()}>
        {t('units-selected', '{{count}} selected', { count: units.length })}
      </CommandBar.Value>
      <Separator.Inline />
      <UnitPicker
        className="w-44"
        value={null}
        withRoot
        placeholder={t('move-under', 'Move under')}
        disabled={busy}
        exclude={(candidate) => units.some((unit) => isWithin(candidate, unit))}
        onChange={(parent) => run(move(parent))}
      />
      <Button variant="secondary" disabled={busy} onClick={() => run(remove())}>
        <IconTrash />
        {t('delete', 'Delete')}
      </Button>
    </CommandBar.Bar>
  );
};

/** At the page bottom while units are picked: how many, move them under a unit, or delete them. */
export const UnitBulkBar = () => {
  const { picked } = useWorkspace();
  const units = [...picked.values()];

  return (
    <CommandBar open={units.length > 0}>{units.length > 0 && <Actions units={units} />}</CommandBar>
  );
};
