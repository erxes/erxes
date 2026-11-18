import type { UnitDetail, UnitNode } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { Button, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from './context';
import { isWithin } from './unitTree';
import { UnitPicker } from './UnitPicker';
import { useStructureHandlers } from './useStructureHandlers';

/**
 * Moves the unit, with everything under it, under another unit. It asks first, with how many
 * units and members move, since who can reach their records follows the tree.
 */
export const MoveBar = ({ unit, onDone }: { unit: UnitDetail; onDone: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { confirm } = useConfirm();
  const { select } = useWorkspace();

  const move = useMutation(
    orpc.units.move.mutationOptions(
      useStructureHandlers((moved) => {
        onDone();
        select(moved.id, moved);
      }),
    ),
  );

  const pick = (parent: UnitNode) => {
    if (parent.id === unit.parentId) return onDone();

    void confirm({
      message: t('move-confirm', 'Move {{name}} under {{parent}}?', {
        name: unit.name,
        parent: parent.name,
      }),
      options: {
        description: t(
          'move-confirm-hint',
          '{{units}} and {{members}} move with it. Who can reach their records may change, since supervisors see the units under theirs.',
          {
            units: t('moving-units', '{{count}} units', { count: unit.descendantCount + 1 }),
            members: t('moving-members', '{{count}} members', { count: unit.subtreeMemberCount }),
          },
        ),
        okLabel: t('move', 'Move'),
      },
    }).then(() => move.mutate({ id: unit.id, parentId: parent.id }));
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed p-2">
      <p className="text-xs text-muted-foreground">
        {t('move-hint', 'Its subunits and members move with it.')}
      </p>
      <div className="flex items-center gap-2">
        <UnitPicker
          className="min-w-0 flex-1"
          value={unit.parentId}
          withRoot
          placeholder={t('move-under', 'Move under')}
          disabled={move.isPending}
          exclude={(candidate) => isWithin(candidate, unit)}
          onChange={pick}
        />
        <Button variant="ghost" size="sm" onClick={onDone}>
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </div>
  );
};
