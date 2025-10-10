import { ITag, useGiveTags, useTags } from 'ui-modules';
import { IconSettings, IconTag } from '@tabler/icons-react';
import { Input, Popover, Spinner } from 'erxes-ui';
import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';
import { TagTree } from './TagTree';
import Tags from './Tags';
import { buildTree } from './BuildTree';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';

const SelectTags = ({
  dealTags,
  tagIds,
}: {
  dealTags: ITag[];
  tagIds: string[];
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(tagIds));

  const [targetId] = useAtom(dealDetailSheetState);

  const {
    tags = [],
    loading,
    totalCount,
  } = useTags({
    variables: {
      type: 'sales:deal',
    },
  });

  const { giveTags, loading: giveTagsLoading } = useGiveTags();

  const treeData = useMemo(() => buildTree(tags), [tags]);

  const toggleExpand = (id: string) => {
    const copy = new Set(expandedIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setExpandedIds(copy);
  };

  const toggleSelect = (id: string) => {
    const copy = new Set(selectedIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setSelectedIds(copy);
  };

  const handleOpenChange = async (nextOpen: boolean) => {
    if (!nextOpen && selectedIds.size > 0) {
      await giveTags({
        variables: {
          type: 'sales:deal',
          tagIds: Array.from(selectedIds),
          targetIds: [targetId],
        },
      });
    }

    setOpen(nextOpen);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tags tags={dealTags} />
      <Popover open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <div className="flex items-center gap-1 min-h-8 cursor-pointer">
            <IconTag size={16} />
            Select tags
          </div>
        </Popover.Trigger>

        <Popover.Content className="w-[300px] p-2" side="bottom" align="start">
          <div className="w-full space-y-2 max-h-[600px] overflow-y-auto">
            <div className="text-sm font-semibold text-gray-600 pb-1 border-b">
              Choose your tags ({totalCount || 0})
            </div>

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tags"
            />
            {loading || giveTagsLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" />
              </div>
            ) : tags.length === 0 ? (
              <div className="text-sm text-gray-400 py-4 text-center">
                No tags available
              </div>
            ) : (
              <TagTree
                treeData={treeData}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                selectedIds={selectedIds}
                toggleSelect={toggleSelect}
                search={search}
              />
            )}
          </div>
          <div className="border-t pt-2 mt-2">
            <Link
              to="/settings/tags"
              className="flex items-center gap-2 text-sm text-gray-600 px-2 py-1 hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              <IconSettings size={14} />
              Manage Tags
            </Link>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  );
};

export default SelectTags;
