import type { Unit, UnitType } from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import { UnitKind } from '@erxes/core-contract/values';
import { IconHierarchy2, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  MemberInline,
  PageContainer,
  PageHeader,
  ScrollArea,
  Table,
  Tabs,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { UnitDialog } from './UnitDialog';
import { TypeBadge, UnitTypes } from './UnitTypes';
import { treeRows, useUnitMutations, useUnits, useUnitTypes } from './useUnits';

/** How the page words branches or departments. */
const useWords = (kind: UnitKind) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return kind === 'branch'
    ? {
        tab: t('branches', 'Branches'),
        add: t('add-branch', 'Add branch'),
        edit: t('edit-branch', 'Edit branch'),
        empty: t('no-branches', 'No branches yet. Branches are where your team works.'),
        hint: t('branch-hint', 'Where people work. A branch can sit under another branch.'),
      }
    : {
        tab: t('departments', 'Departments'),
        add: t('add-department', 'Add department'),
        edit: t('edit-department', 'Edit department'),
        empty: t('no-departments', 'No departments yet. Departments are what your team does.'),
        hint: t(
          'department-hint',
          'What people do. A department can sit under another department.',
        ),
      };
};

/** A row's edit and delete buttons. */
const UnitActions = ({ unit, onEdit }: { unit: Unit; onEdit: (unit: Unit) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { confirm } = useConfirm();
  const { remove } = useUnitMutations();

  return (
    <Table.Cell className="text-right">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('edit', 'Edit')}
        onClick={() => onEdit(unit)}
      >
        <IconPencil />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('remove', 'Delete')}
        onClick={() =>
          void confirm({
            message: t(
              'remove-confirm',
              'Delete {{name}}? The units under it move up a level, and plugins drop it from their records.',
              { name: unit.name },
            ),
          }).then(() => remove.mutate({ id: unit.id }))
        }
      >
        <IconTrash />
      </Button>
    </Table.Cell>
  );
};

/** The units of one kind as an indented tree, with who leads each and how many are in it. */
const UnitTable = ({
  units,
  types,
  canChange,
  onEdit,
}: {
  units: Unit[];
  types: UnitType[];
  canChange: boolean;
  onEdit: (unit: Unit) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <Table variant="card" className="overflow-hidden">
      <Table.Header>
        <Table.Row>
          <Table.Head>{t('name', 'Name')}</Table.Head>
          <Table.Head>{t('type', 'Type')}</Table.Head>
          <Table.Head>{t('code', 'Code')}</Table.Head>
          <Table.Head>{t('supervisor', 'Supervisor')}</Table.Head>
          <Table.Head className="text-right">{t('members', 'Members')}</Table.Head>
          {canChange && <Table.Head className="w-20" />}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {treeRows(units).map(({ unit, depth }) => (
          <Table.Row key={unit.id}>
            <Table.Cell>
              <span className="text-muted-foreground">{'— '.repeat(depth)}</span>
              <span className="font-medium">{unit.name}</span>
            </Table.Cell>
            <Table.Cell>
              <TypeBadge type={types.find((type) => type.id === unit.typeId)} />
            </Table.Cell>
            <Table.Cell>
              <span className="text-muted-foreground">{unit.code}</span>
            </Table.Cell>
            <Table.Cell>
              {unit.supervisorId && (
                <span className="inline-flex items-center gap-2 text-sm">
                  <MemberInline memberId={unit.supervisorId} members={memberQueries} size="sm" />
                </span>
              )}
            </Table.Cell>
            <Table.Cell className="text-right">{unit.memberIds.length}</Table.Cell>
            {canChange && <UnitActions unit={unit} onEdit={onEdit} />}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const KindPanel = ({ kind, canChange }: { kind: UnitKind; canChange: boolean }) => {
  const words = useWords(kind);
  const query = useUnits(kind);
  const typeQuery = useUnitTypes(kind);
  const [editing, setEditing] = useState<Unit | 'new' | null>(null);
  const units = query.data?.data ?? [];
  const types = typeQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <QueryState query={typeQuery}>
          {() => <UnitTypes kind={kind} types={types} canChange={canChange} />}
        </QueryState>
        {canChange && (
          <Button onClick={() => setEditing('new')}>
            <IconPlus />
            {words.add}
          </Button>
        )}
      </div>
      <QueryState
        query={query}
        isEmpty={(data) => !data.data.length}
        empty={<p className="py-12 text-center text-sm text-muted-foreground">{words.empty}</p>}
      >
        {(data) => (
          <UnitTable units={data.data} types={types} canChange={canChange} onEdit={setEditing} />
        )}
      </QueryState>
      <UnitDialog
        kind={kind}
        unit={editing === 'new' ? null : editing}
        units={units}
        types={types}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === 'new' ? words.add : words.edit}
        description={words.hint}
      />
    </div>
  );
};

/**
 * Settings › Structure: the organisation's branches (where people work) and departments (what
 * they do), shared by every plugin.
 */
export const StructurePage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const canChange = useCan()('structure.manage');
  const [kind, setKind] = useState<UnitKind>('branch');
  const branch = useWords('branch');
  const department = useWords('department');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Structure'),
                to: paths.settings.structure,
                icon: IconHierarchy2,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'description',
              'Branches and departments are shared by every plugin: pipelines, tickets and reports use the same ones, and supervisors see the records of the units they lead.',
            )}
          </p>
          <Tabs
            value={kind}
            onValueChange={(value) => {
              const picked = UnitKind.safeParse(value);

              if (picked.success) setKind(picked.data);
            }}
          >
            <Tabs.List>
              <Tabs.Trigger value="branch">{branch.tab}</Tabs.Trigger>
              <Tabs.Trigger value="department">{department.tab}</Tabs.Trigger>
            </Tabs.List>
            {UnitKind.options.map((one) => (
              <Tabs.Content key={one} value={one} className="mt-4">
                <KindPanel kind={one} canChange={canChange} />
              </Tabs.Content>
            ))}
          </Tabs>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
