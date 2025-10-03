import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';

import { TagNode } from './BuildTree';
import { cn } from 'erxes-ui';

type TreeNodeProps = {
  node: TagNode;
  level?: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  search: string;
};

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level = 0,
  expandedIds,
  toggleExpand,
  selectedIds,
  toggleSelect,
  search,
}) => {
  const isExpanded = expandedIds.has(node._id);
  const isSelected = selectedIds.has(node._id);

  const matchesSearch = (tag: TagNode) =>
    tag.name.toLowerCase().includes(search.toLowerCase());

  const shouldShow =
    !search || matchesSearch(node) || node.children.some(matchesSearch);

  if (!shouldShow) return null;

  return (
    <div key={node._id} className="ml-2">
      <div
        className={cn(
          'flex items-center justify-between py-1 pl-2 pr-1 rounded hover:bg-gray-50 cursor-pointer',
          isSelected && 'bg-blue-50',
        )}
        style={{ marginLeft: level * 12 }}
        onClick={() => toggleSelect(node._id)}
      >
        <div className="flex items-center gap-2">
          {node.children.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node._id);
              }}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
              type="button"
            >
              {isExpanded ? (
                <IconChevronDown size={14} />
              ) : (
                <IconChevronRight size={14} />
              )}
            </button>
          ) : (
            <span className="w-[14px]" />
          )}

          {node.colorCode && (
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: node.colorCode }}
            />
          )}
          <span className="text-sm">{node.name}</span>
        </div>

        {isSelected && <IconCheck size={14} className="text-blue-500" />}
      </div>

      {isExpanded &&
        node.children.length > 0 &&
        node.children.map((child) => (
          <TreeNode
            key={child._id}
            node={child}
            level={level + 1}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
            selectedIds={selectedIds}
            toggleSelect={toggleSelect}
            search={search}
          />
        ))}
    </div>
  );
};

type TagTreeProps = {
  treeData: TagNode[];
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  search: string;
};

export const TagTree: React.FC<TagTreeProps> = ({
  treeData,
  expandedIds,
  toggleExpand,
  selectedIds,
  toggleSelect,
  search,
}) => {
  return (
    <>
      {treeData.map((node) => (
        <TreeNode
          key={node._id}
          node={node}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
          search={search}
        />
      ))}
    </>
  );
};
