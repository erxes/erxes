import { TAG_DEFAULT_COLORS } from '@/settings/tags/constants/Colors';
import {
  ActiveFilter,
  DraftKind,
  DraftState,
  SelectionCapability,
} from '@/settings/tags/types/tagTree';
import { ITag } from 'ui-modules';
import { useCallback, useEffect, useMemo, useState } from 'react';

const randomColor = (): string => {
  const colors = Object.values(TAG_DEFAULT_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

const deriveCapability = (
  selectedIds: Set<string>,
  tags: ITag[],
): SelectionCapability => {
  if (selectedIds.size === 0) return { canDelete: false, canMove: false };

  const selectedTags = tags.filter((t) => selectedIds.has(t._id));
  const hasGroups = selectedTags.some((t) => t.isGroup);
  const hasTags = selectedTags.some((t) => !t.isGroup);

  if (hasGroups && hasTags) {
    return {
      canDelete: true,
      canMove: false,
      moveDisabledReason:
        'Only standalone or child tags can be moved together',
    };
  }

  if (hasGroups && !hasTags) {
    return { canDelete: true, canMove: false };
  }

  return { canDelete: true, canMove: true };
};

export const useTagsPageState = (tags: ITag[]) => {
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Auto-cancel draft when search or filter changes
  useEffect(() => {
    if (searchTerm || activeFilter !== 'all') {
      setDraft(null);
    }
  }, [searchTerm, activeFilter]);

  const startDraft = useCallback(
    (kind: DraftKind, parentId?: string) => {
      if (kind === 'child-tag' && parentId) {
        setExpandedGroupIds((prev) => new Set([...prev, parentId]));
      }
      setDraft({
        kind,
        parentId,
        name: '',
        description: '',
        touched: false,
        colorCode: randomColor(),
      });
    },
    [],
  );

  const cancelDraft = useCallback(() => setDraft(null), []);

  const updateDraft = useCallback(
    (patch: Partial<Pick<DraftState, 'name' | 'description' | 'touched'>>) => {
      setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [],
  );

  const toggleExpand = useCallback((groupId: string) => {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const toggleSelect = useCallback((tagId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(
    (tagIds: string[]) => {
      setSelectedIds(new Set(tagIds));
    },
    [],
  );

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectionCapability = useMemo(
    () => deriveCapability(selectedIds, tags),
    [selectedIds, tags],
  );

  return {
    expandedGroupIds,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    draft,
    setDraft,
    startDraft,
    cancelDraft,
    updateDraft,
    selectedIds,
    toggleExpand,
    toggleSelect,
    selectAll,
    clearSelection,
    selectionCapability,
  };
};
