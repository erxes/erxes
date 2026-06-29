import { useRef, useState } from 'react';
import { Button, Calendar, Command, RecordTable, toast } from 'erxes-ui';
import {
  IconCalendarEvent,
  IconCheck,
  IconChevronRight,
  IconFolder,
  IconProgressCheck,
  IconStar,
  IconStarOff,
  IconTag,
  IconTemplate,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useBulkEditPosts } from '../../hooks/useBulkEditPosts';
import { useCategories } from '@/cms/categories/hooks/useCategoriesEnhanced';
import { useTags } from '@/cms/hooks/useTags';
import { useCustomTypes } from '@/cms/custom-types/hooks/useCustomTypes';
import { STATUS_DATA } from '../../constants/statusData';
import {
  getErrorMessage,
  getRecordTableSelectedIds,
} from '@/cms/shared/utils';
import { BulkEditPopover } from '@/cms/shared/components/BulkEditPopover';

const toggleSelectedId = (ids: string[], id: string) =>
  ids.includes(id)
    ? ids.filter((selectedId) => selectedId !== id)
    : [...ids, id];

export const PostsBulkEdit = ({
  clientPortalId,
  onRefetch,
}: {
  clientPortalId: string;
  onRefetch?: () => void;
}) => {
  const { t } = useTranslation('content');
  const [open, setOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState('main');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { table } = RecordTable.useRecordTable();
  const { bulkEditPosts, loading } = useBulkEditPosts();
  const selectedIds = getRecordTableSelectedIds(
    table.getFilteredSelectedRowModel().rows,
  );

  const { categories, loading: catsLoading } = useCategories({
    variables: { clientPortalId, status: undefined },
    skip: currentContent !== 'category',
  });
  const { tags, loading: tagsLoading } = useTags({
    clientPortalId,
    fetchAll: true,
    skip: currentContent !== 'tags',
  });
  const { customTypes } = useCustomTypes({
    clientPortalId,
    skip: currentContent !== 'type',
  });

  const closePopover = () => {
    setOpen(false);
    setCurrentContent('main');
    setSelectedTagIds([]);
  };

  const handleEdit = async (input: Record<string, unknown>) => {
    try {
      await bulkEditPosts(selectedIds, input);
      closePopover();
      onRefetch?.();
      toast({ title: t('success'), variant: 'default' });
    } catch (error) {
      toast({
        title: t('error'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((ids) => toggleSelectedId(ids, tagId));
  };

  return (
    <BulkEditPopover
      open={open}
      loading={loading}
      onOpenChange={(v) => {
        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
          resetTimerRef.current = null;
        }

        setOpen(v);
        if (!v) {
          resetTimerRef.current = setTimeout(() => {
            setCurrentContent('main');
            setSelectedTagIds([]);
            resetTimerRef.current = null;
          }, 100);
        }
      }}
    >
      {currentContent === 'main' && (
        <Command>
          <Command.Input />
          <Command.List className="p-0">
            <Command.Group className="p-1">
              <Command.Item
                className="w-full justify-between"
                onSelect={() => setCurrentContent('status')}
              >
                <div className="flex gap-2 items-center">
                  <IconProgressCheck className="size-4" />
                  {t('status')}
                </div>
                <IconChevronRight />
              </Command.Item>
              <Command.Item
                className="w-full justify-between"
                onSelect={() => setCurrentContent('category')}
              >
                <div className="flex gap-2 items-center">
                  <IconFolder className="size-4" />
                  {t('category')}
                </div>
                <IconChevronRight />
              </Command.Item>
              <Command.Item
                className="w-full justify-between"
                onSelect={() => setCurrentContent('tags')}
              >
                <div className="flex gap-2 items-center">
                  <IconTag className="size-4" />
                  {t('tags')}
                </div>
                <IconChevronRight />
              </Command.Item>
              <Command.Item
                className="w-full justify-between"
                onSelect={() => setCurrentContent('publishDate')}
              >
                <div className="flex gap-2 items-center">
                  <IconCalendarEvent className="size-4" />
                  {t('publish-date')}
                </div>
                <IconChevronRight />
              </Command.Item>
              <Command.Item
                className="w-full justify-between"
                onSelect={() => setCurrentContent('type')}
              >
                <div className="flex gap-2 items-center">
                  <IconTemplate className="size-4" />
                  {t('post-type')}
                </div>
                <IconChevronRight />
              </Command.Item>
            </Command.Group>
            <Command.Separator />
            <Command.Group className="p-1">
              <Command.Item onSelect={() => handleEdit({ featured: true })}>
                <div className="flex gap-2 items-center">
                  <IconStar className="size-4" />
                  {t('set-featured')}
                </div>
              </Command.Item>
              <Command.Item onSelect={() => handleEdit({ featured: false })}>
                <div className="flex gap-2 items-center">
                  <IconStarOff className="size-4" />
                  {t('unset-featured')}
                </div>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      )}

      {currentContent === 'status' && (
        <Command>
          <Command.List>
            <Command.Group className="p-1">
              {STATUS_DATA.map((s) => (
                <Command.Item key={s.value} onSelect={() => handleEdit({ status: s.value })}>
                  {t(s.value)}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      )}

      {currentContent === 'category' && (
        <Command>
          <Command.Input placeholder={t('search-categories')} />
          <Command.List>
            <Command.Group className="p-1">
              {catsLoading && <Command.Item disabled>{t('loading')}</Command.Item>}
              {categories.map((cat) => (
                <Command.Item
                  key={cat._id}
                  onSelect={() => handleEdit({ categoryIds: [cat._id] })}
                >
                  {cat.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      )}

      {currentContent === 'tags' && (
        <div>
          <Command>
            <Command.Input placeholder={t('search-tags')} />
            <Command.List>
              <Command.Group className="p-1">
                {tagsLoading && <Command.Item disabled>{t('loading')}</Command.Item>}
                {tags.map((tag) => (
                  <Command.Item
                    key={tag._id}
                    onSelect={() => handleTagToggle(tag._id)}
                  >
                    <IconCheck
                      className="size-3.5 mr-1"
                      style={{ opacity: selectedTagIds.includes(tag._id) ? 1 : 0 }}
                    />
                    <span
                      className="size-3 rounded-full inline-block mr-1 shrink-0"
                      style={{ backgroundColor: tag.colorCode || '#3B82F6' }}
                    />
                    {tag.name}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
          <div className="p-2 border-t">
            <Button
              size="sm"
              className="w-full"
              disabled={selectedTagIds.length === 0 || loading}
              onClick={() => handleEdit({ tagIds: selectedTagIds })}
            >
              {t('apply')}
            </Button>
          </div>
        </div>
      )}

      {currentContent === 'type' && (
        <Command>
          <Command.List>
            <Command.Group className="p-1">
              <Command.Item onSelect={() => handleEdit({ type: 'post' })}>
                {t('remove-post-type')}
              </Command.Item>
            </Command.Group>
            <Command.Separator />
            <Command.Group className="p-1">
              {customTypes.map((type) => (
                <Command.Item
                  key={type._id}
                  onSelect={() => handleEdit({ type: type._id })}
                >
                  {type.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      )}

      {currentContent === 'publishDate' && (
        <Calendar
          mode="single"
          onSelect={(date) => {
            if (date) handleEdit({ publishedDate: date.toISOString() });
          }}
          disabled={loading}
        />
      )}
    </BulkEditPopover>
  );
};
