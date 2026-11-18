import type { UnitDetail } from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import { IconX } from '@tabler/icons-react';
import { Button, MemberInline, SelectMember } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from './context';
import { useSaveUnit } from './UnitFields';
import { SectionHeading } from './UnitSubunits';

const SHOWN = 8;

/**
 * Who is in the unit itself, the first few until asked for all. Members who manage the structure
 * add and take people out here.
 */
export const UnitPeople = ({ unit }: { unit: UnitDetail }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { canManage, canSeeTeam } = useWorkspace();
  const save = useSaveUnit();
  const [all, setAll] = useState(false);
  const ids = unit.memberIds;
  const shown = all ? ids : ids.slice(0, SHOWN);
  const editable = canManage && canSeeTeam;
  const setMembers = (memberIds: string[]) => save.mutate({ id: unit.id, memberIds });

  return (
    <section className="flex flex-col gap-1.5">
      <SectionHeading title={t('members', 'Members')} count={ids.length} />
      {!canSeeTeam ? null : ids.length ? (
        <ul className="flex flex-col">
          {shown.map((id) => (
            <li key={id} className="flex h-9 items-center gap-2 px-1 text-sm">
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <MemberInline memberId={id} members={memberQueries} />
              </span>
              {editable && (
                <Button
                  variant="ghost"
                  size="icon"
                  tone="muted"
                  disabled={save.isPending}
                  aria-label={t('remove-member', 'Take out of {{name}}', { name: unit.name })}
                  onClick={() => setMembers(ids.filter((other) => other !== id))}
                >
                  <IconX />
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('nobody-here', 'Nobody is in this unit itself yet.')}
        </p>
      )}
      {canSeeTeam && ids.length > SHOWN && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(!all)}>
          {all
            ? t('show-fewer', 'Show fewer')
            : t('show-all-count', 'Show all {{count}}', { count: ids.length })}
        </Button>
      )}
      {editable && (
        <SelectMember.Field
          value={null}
          members={memberQueries}
          placeholder={t('add-member', 'Add a member')}
          aria-label={t('add-member-to', 'Add a member to {{name}}', { name: unit.name })}
          disabled={save.isPending}
          onValueChange={(memberId) => {
            if (memberId && !ids.includes(memberId)) setMembers([...ids, memberId]);
          }}
        />
      )}
    </section>
  );
};
