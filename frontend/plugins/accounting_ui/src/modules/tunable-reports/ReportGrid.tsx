import { ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, DragHandle, Table } from 'erxes-ui';
import { IconPlus, IconSettings, IconCode } from '@tabler/icons-react';
import { useWatch } from 'react-hook-form';
import { ReportSection } from '@/tunable-reports/schema';
import { ReportForm, TextSetting } from '@/tunable-reports/fields';
import { useReportTranslation } from '@/tunable-reports/locales';

const rowInputClassName = (row: ReportSection['rows'][number]): string =>
  [
    row.isBold ? 'font-bold' : 'font-normal',
    row.isItalic ? 'italic' : 'not-italic',
    row.isUnderline ? 'underline' : 'no-underline',
  ].join(' ');

const GridColumn = ({
  id,
  children,
}: {
  id: string;
  children: (handle: ReactNode) => ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `column:${id}` });
  const { t } = useReportTranslation();
  return (
    <Table.Head
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="w-48 min-w-48 normal-case font-sans"
    >
      {children(
        <DragHandle
          type="button"
          aria-label={`${t('drag')} · ${t('columns')}`}
          {...attributes}
          {...listeners}
        />,
      )}
    </Table.Head>
  );
};
const GridRow = ({
  id,
  children,
  inactive,
  action,
}: {
  id: string;
  children: ReactNode;
  inactive: boolean;
  action: ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `row:${id}` });
  const { t } = useReportTranslation();
  return (
    <Table.Row
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={inactive ? 'opacity-50' : undefined}
    >
      <Table.Cell className="w-16 p-1">
        <div className="flex items-center gap-1">
          <DragHandle
            type="button"
            aria-label={`${t('drag')} · ${t('rows')}`}
            {...attributes}
            {...listeners}
          />
          {action}
        </div>
      </Table.Cell>
      {children}
    </Table.Row>
  );
};
export type GridTarget = { rowId: string; columnId: string };
export const ReportGrid = ({
  form,
  index,
  rowFields,
  columnFields,
  moveRow,
  moveColumn,
  addRow,
  editRow,
  editColumn,
  editCell,
}: {
  form: ReportForm;
  index: number;
  rowFields: ReportSection['rows'];
  columnFields: ReportSection['columns'];
  moveRow: (from: number, to: number) => void;
  moveColumn: (from: number, to: number) => void;
  addRow: () => void;
  editRow: (id: string) => void;
  editColumn: (id: string) => void;
  editCell: (target: GridTarget) => void;
}) => {
  const { t } = useReportTranslation();
  const path = `sections.${index}` as const;
  const watched = useWatch({ control: form.control, name: path });
  // Field-array ids own the structure; watched values only supply live edits.
  const section = {
    ...watched,
    rows: rowFields.map((row) => ({
      ...row,
      ...watched.rows.find((value) => value._id === row._id),
    })),
    columns: columnFields.map((column) => ({
      ...column,
      ...watched.columns.find((value) => value._id === column._id),
    })),
  };
  const errors = form.formState.errors.sections?.[index]?.formulas;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={(args) =>
        closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) =>
              String(container.id).split(':')[0] ===
              String(args.active.id).split(':')[0],
          ),
        })
      }
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const isColumn = String(active.id).startsWith('column:');
        const kind = isColumn ? 'column' : 'row';
        const items = isColumn ? section.columns : section.rows;
        const from = items.findIndex(
          (item) => `${kind}:${item._id}` === active.id,
        );
        const to = items.findIndex((item) => `${kind}:${item._id}` === over.id);
        if (from >= 0 && to >= 0) (isColumn ? moveColumn : moveRow)(from, to);
      }}
    >
      <div className="relative overflow-x-auto rounded-b-lg">
        <Table className="w-max min-w-full">
          <Table.Header className="[&_th]:border-r [&_th]:border-b [&_th:first-child]:border-l">
            <Table.Row>
              <Table.Head className="w-16" />
              <Table.Head className="w-20">{t('number')}</Table.Head>
              <Table.Head className="w-72 min-w-72">{t('name')}</Table.Head>
              <SortableContext
                items={section.columns.map((column) => `column:${column._id}`)}
                strategy={horizontalListSortingStrategy}
              >
                {section.columns.map((column, columnIndex) => (
                  <GridColumn key={column._id} id={column._id}>
                    {(handle) => (
                      <div
                        className={column.isActive ? 'py-2' : 'py-2 opacity-50'}
                      >
                        <div className="flex items-center gap-1">
                          {handle}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0"
                            aria-label={`${t('columnSettings')} · ${
                              column.name
                            }`}
                            onClick={() => editColumn(column._id)}
                          >
                            <IconSettings className="size-3.5" />
                          </Button>
                          <div className="min-w-0 flex-1">
                            <TextSetting
                              form={form}
                              name={`${path}.columns.${columnIndex}.name`}
                              label={t('name')}
                              inline
                            />
                          </div>
                        </div>
                        <p className="px-7 text-xs font-normal text-muted-foreground">
                          {t(column.getDate || 'inherit')}
                          {column.isPre ? ` · ${t('previous')}` : ''}
                        </p>
                      </div>
                    )}
                  </GridColumn>
                ))}
              </SortableContext>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <SortableContext
              items={section.rows.map((row) => `row:${row._id}`)}
              strategy={verticalListSortingStrategy}
            >
              {section.rows.map((row, rowIndex) => (
                <GridRow
                  key={row._id}
                  id={row._id}
                  inactive={!row.isActive}
                  action={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-accent-foreground"
                      aria-label={`${t('rowSettings')} · ${
                        row.name || row.number
                      }`}
                      onClick={() => editRow(row._id)}
                    >
                      <IconSettings className="size-3.5" />
                    </Button>
                  }
                >
                  <Table.Cell className="w-20">
                    <TextSetting
                      form={form}
                      name={`${path}.rows.${rowIndex}.number`}
                      label={t('number')}
                      inputClassName={rowInputClassName(row)}
                      inline
                    />
                  </Table.Cell>
                  <Table.Cell className="w-72 min-w-72">
                    <div className="flex items-center gap-1">
                      <div className="flex min-w-0 flex-1 items-center">
                        <span
                          aria-hidden="true"
                          className="shrink-0 whitespace-pre"
                        >
                          {' '.repeat(row.tabCount * 4)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <TextSetting
                            form={form}
                            name={`${path}.rows.${rowIndex}.name`}
                            label={t('name')}
                            inputClassName={rowInputClassName(row)}
                            inline
                          />
                        </div>
                      </div>
                    </div>
                  </Table.Cell>
                  {(section.formulaType === 'row'
                    ? section.columns.slice(0, 1)
                    : section.columns
                  ).map((column) => {
                    const formulas = section.formulas
                      .map((formula, formulaIndex) => ({
                        formula,
                        formulaIndex,
                      }))
                      .filter(
                        ({ formula }) =>
                          formula.rowId === row._id &&
                          (section.formulaType === 'row' ||
                            formula.columnId === column._id),
                      );
                    const invalid = formulas.some(
                      ({ formulaIndex }) => errors?.[formulaIndex],
                    );
                    return (
                      <Table.Cell
                        key={column._id}
                        colSpan={
                          section.formulaType === 'row'
                            ? section.columns.length
                            : 1
                        }
                        className={invalid ? 'bg-destructive/10' : undefined}
                      >
                        {(row.kind === 'formula' ||
                          row.kind === 'plus_formula') && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-10 w-full justify-center gap-1.5 rounded-none px-3 font-mono text-muted-foreground hover:text-foreground"
                            aria-label={`${t('configureFormula')} · ${
                              row.name || row.number
                            } · ${
                              section.formulaType === 'row'
                                ? t('rowScope')
                                : column.name
                            }`}
                            onClick={() =>
                              editCell({ rowId: row._id, columnId: column._id })
                            }
                          >
                            <IconCode className="size-4" />
                            <span>{formulas.length}</span>
                          </Button>
                        )}
                      </Table.Cell>
                    );
                  })}
                </GridRow>
              ))}
            </SortableContext>
          </Table.Body>
        </Table>
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full justify-start gap-2 rounded-none px-3 text-muted-foreground"
          onClick={addRow}
        >
          <IconPlus className="size-4" />
          {t('addRow')}
        </Button>
      </div>
    </DndContext>
  );
};
