import { TagActionsCell } from '@/settings/tags/components/TagActionsCell';
import { TagCheckboxCell } from '@/settings/tags/components/TagCheckboxCell';
import { TagDatesCell } from '@/settings/tags/components/TagDatesCell';
import { TagDescriptionCell } from '@/settings/tags/components/TagDescriptionCell';
import { TagDraftRow } from '@/settings/tags/components/TagDraftRow';
import { TagNameCell } from '@/settings/tags/components/TagNameCell';
import { TagUsageCell } from '@/settings/tags/components/TagUsageCell';
import { DraftState, VisibleRow } from '@/settings/tags/types/tagTree';
import { cn } from 'erxes-ui';
import { ITag } from 'ui-modules';

interface TagTreeRowProps {
  row: VisibleRow;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  tagGroups: ITag[];
  tagsByParentId: Record<string, ITag[]>;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onDraftSave: (name: string, description: string) => void;
  onDraftCancel: () => void;
}

export const TagTreeRow = ({
  row,
  isSelected,
  isExpanded,
  hasChildren,
  tagGroups,
  tagsByParentId,
  onToggleSelect,
  onToggleExpand,
  onAddChild,
  onDraftSave,
  onDraftCancel,
}: TagTreeRowProps) => {
  if (row.rowType === 'draft') {
    return (
      <TagDraftRow
        draft={row.draft as DraftState}
        depth={row.depth}
        onSave={onDraftSave}
        onCancel={onDraftCancel}
      />
    );
  }

  const tag = row.tag;
  const isContext = row.isContext === true;
  const childCount =
    tag.isGroup ? (tagsByParentId[tag._id] ?? []).length : undefined;

  return (
    <div
      className={cn(
        'h-10 w-full shadow-xs flex items-center group hover:bg-foreground/10 bg-background relative',
        isSelected && 'bg-primary/5 hover:bg-primary/8',
        isContext && 'opacity-50 pointer-events-none',
      )}
      onClick={() => !isContext && !tag.isGroup && onToggleSelect(tag._id)}
    >
      {/* Checkbox - hidden for context rows and groups */}
      {!isContext && !tag.isGroup && (
        <TagCheckboxCell
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(tag._id)}
        />
      )}
      {(isContext || tag.isGroup) && <div className="w-10 shrink-0" />}

      {/* Name */}
      <TagNameCell
        tag={tag}
        depth={row.depth}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        hasChildren={hasChildren}
      />

      {/* Description */}
      <TagDescriptionCell tag={tag} />

      {/* Usage count */}
      <TagUsageCell tag={tag} />

      {/* Created at */}
      <TagDatesCell tag={tag} />

      {/* Actions */}
      {!isContext && (
        <div className="w-8 shrink-0 flex items-center justify-center">
          <TagActionsCell
            tag={tag}
            tagGroups={tagGroups}
            childCount={childCount}
            onAddChild={onAddChild}
          />
        </div>
      )}
      {isContext && <div className="w-8 shrink-0" />}
    </div>
  );
};
