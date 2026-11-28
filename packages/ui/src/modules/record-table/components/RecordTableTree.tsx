import type { ComponentProps, ReactNode } from 'react';
import { cn } from 'erxes-ui/lib/utils';
import {
  fixOrder,
  levelOf,
  TreeArrow,
  TreeProvider,
  useTreeFold,
} from 'erxes-ui/modules/tree/treeFold';
import { RecordTableRow } from './RecordTableRow';

/** The order of a row's record, when it has one. */
const orderOf = (original: unknown) =>
  typeof original === 'object' &&
  original !== null &&
  'order' in original &&
  typeof original.order === 'string'
    ? original.order
    : undefined;

/** One indent step per level, as wide as a fold arrow, for a row whose tree is in order. */
const RecordTableTreeIndentation = ({ order, name }: { order: string; name: string }) => {
  const fixed = fixOrder({ order, name });
  const { ordered } = useTreeFold(fixed);
  const level = levelOf(fixed);

  if (level <= 0 || !ordered) return null;

  return (
    <div className="flex h-full gap-8 px-3.5">
      {Array.from({ length: level }, (_, index) => (
        <div key={index} />
      ))}
    </div>
  );
};

/** A table row that hides while a row above it in the tree is folded. */
const RecordTableTreeRow = (props: ComponentProps<typeof RecordTableRow>) => {
  const { ordered, isHiddenByParent } = useTreeFold(orderOf(props.original));

  if (ordered && isHiddenByParent) return null;

  return <RecordTableRow {...props} />;
};

/** A tree cell's start: the row's indent and its fold arrow, then `children`. */
const RecordTableTreeTrigger = ({
  order,
  name,
  hasChildren,
  className,
  children,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  order: string;
  name: string;
  hasChildren: boolean;
  children?: ReactNode;
}) => (
  <div className={cn('flex items-center gap-1', className)} {...props}>
    <RecordTableTreeIndentation order={order} name={name} />
    <TreeArrow order={order} hasChildren={hasChildren} />
    {children}
  </div>
);

const RecordTableTreeRoot = (props: ComponentProps<typeof TreeProvider>) => (
  <TreeProvider {...props} />
);

/**
 * A record table whose rows are a tree, indented with arrows that fold.
 * Wrap the table in it with an `id` and `ordered` (rows in tree order, each with its `order`
 * path such as "01/02/"), render rows with `RecordTable.RowList Row={RecordTableTree.Row}`, and
 * start the first cell with `RecordTableTree.Trigger`. Every row opens again when `length` changes.
 */
export const RecordTableTree = Object.assign(RecordTableTreeRoot, {
  Indentation: RecordTableTreeIndentation,
  Arrow: TreeArrow,
  Trigger: RecordTableTreeTrigger,
  Row: RecordTableTreeRow,
});
