import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconCalendarEvent,
  IconCalendarPlus,
  IconCalendarUp,
  IconFile,
  IconClock,
  IconTag,
  IconFolder,
  IconHash,
  IconUser,
  IconEye,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { postMoreColumn } from './PostMoreColumn';
import { PostsRecordTableStatusInlineCell } from './PostsRecordTableStatusInlineCell';
import { PostPublicUrlButton } from './PostPublicUrlButton';
import { useIsTranslationMissing } from '../../shared/hooks/useIsTranslationMissing';
import { CmsTranslatableBadge } from '../../shared/components/CmsTranslatableBadge';
import type { Posts } from '../types/postsType';
import type { IWebsite } from '../../types';
import { buildCurrentPostsReturnPath } from '../utils/postsNavigation';

const getPostAuthorName = (post: Posts) => {
  const details = post.author?.details;
  const nameFromDetails = [
    details?.firstName,
    details?.middleName,
    details?.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    details?.fullName ||
    details?.shortName ||
    nameFromDetails ||
    post.author?.username ||
    post.author?.email ||
    post.authorId ||
    ''
  );
};

const PublicPostLinkCell = ({
  post,
  cmsConfig,
}: {
  post: Posts;
  cmsConfig?: IWebsite;
}) => {
  return (
    <RecordTableInlineCell>
      <span className="inline-flex h-full w-full items-center justify-center">
        <PostPublicUrlButton post={post} cmsConfig={cmsConfig} iconOnly />
      </span>
    </RecordTableInlineCell>
  );
};

export const usePostsColumns = (
  onEditPost?: (post: Posts) => void,
  onRefetch?: () => void,
  cmsConfig?: IWebsite,
): ColumnDef<Posts>[] => {
  const { t } = useTranslation('content');
  const navigate = useNavigate();
  const location = useLocation();
  const { isMissing } = useIsTranslationMissing();

  return [
    {
      id: 'openPublicUrl',
      header: () => <span className="sr-only">{t('open-on-site')}</span>,
      cell: ({ row }) => (
        <PublicPostLinkCell post={row.original} cmsConfig={cmsConfig} />
      ),
      size: 40,
    },
    postMoreColumn(onEditPost, undefined, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<Posts>,
    {
      id: 'title',
      header: () => (
        <RecordTable.InlineHead label={t('post-name')} icon={IconFile} />
      ),
      accessorKey: 'title',
      cell: ({ row }) => {
        const post = row.original;
        const missing = isMissing(post.translations);
        return (
          <RecordTableInlineCell>
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onEditPost) {
                  onEditPost(post);
                  return;
                }

                navigate(
                  `/content/cms/${post.clientPortalId}/posts/detail/${post._id}`,
                  {
                    state: {
                      returnTo: buildCurrentPostsReturnPath(
                        location.pathname,
                        location.search,
                        post._id,
                      ),
                    },
                  },
                );
              }}
              className="cursor-pointer "
            >
              <CmsTranslatableBadge
                value={post.title}
                missing={missing}
                placeholder={t('untitled-post')}
              />
            </div>
          </RecordTableInlineCell>
        );
      },
      size: 400,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: () => <RecordTable.InlineHead label={t('status')} icon={IconClock} />,
      cell: ({ cell }) => {
        return <PostsRecordTableStatusInlineCell cell={cell} />;
      },
      size: 120,
    },
    {
      id: 'categories',
      accessorKey: 'categories',
      header: () => (
        <RecordTable.InlineHead icon={IconFolder} label={t('categories')} />
      ),
      cell: ({ row }) => {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip
              value={
                row.original.categories
                  ?.map((category) => category.name)
                  .join(', ') || ''
              }
              className="leading-normal"
            />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'tags',
      accessorKey: 'tags',
      header: () => <RecordTable.InlineHead icon={IconHash} label={t('tags')} />,
      cell: ({ row }) => {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip
              value={row.original.tags?.map((tag) => tag.name).join(', ') || ''}
              className="leading-normal"
            />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'author',
      accessorFn: (post) => getPostAuthorName(post),
      header: () => <RecordTable.InlineHead icon={IconUser} label={t('author')} />,
      cell: ({ row }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={getPostAuthorName(row.original)}
            className="leading-normal"
          />
        </RecordTableInlineCell>
      ),
      size: 180,
    },
    {
      id: 'views',
      accessorKey: 'viewCount',
      header: () => <RecordTable.InlineHead icon={IconEye} label={t('views')} />,
      cell: ({ row }) => (
        <RecordTableInlineCell className="text-muted-foreground">
          {row.original.viewCount ?? 0}
        </RecordTableInlineCell>
      ),
      size: 100,
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: () => <RecordTable.InlineHead icon={IconTag} label={t('type')} />,
      cell: ({ row }) => {
        const post = row.original;
        const typeLabel =
          post.customPostType?.label ||
          (post.type === 'post' ? 'Post' : post.type);
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={typeLabel} className="leading-normal" />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'scheduledDate',
      header: () => (
        <div className="flex items-center gap-1 cursor-pointer select-none">
          <RecordTable.InlineHead
            label={t('publish-date')}
            icon={IconCalendarEvent}
          />
        </div>
      ),
      accessorFn: (row) =>
        row.scheduledDate || row.publishedDate || row.createdAt,
      cell: ({ row }) => {
        const date =
          row.original.scheduledDate ||
          row.original.publishedDate ||
          row.original.createdAt;
        return (
          <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1">
            <IconCalendarEvent className="h-3 w-3" />
            {date
              ? new Date(date).toLocaleDateString('mn-MN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : t('date-not-selected')}
          </div>
        );
      },
    },
    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead label={t('created-at')} icon={IconCalendarPlus} />
      ),
      accessorKey: 'createdAt',
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
      size: 140,
    },
    {
      id: 'updatedAt',
      header: () => (
        <RecordTable.InlineHead label={t('updated-at')} icon={IconCalendarUp} />
      ),
      accessorKey: 'updatedAt',
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
      size: 140,
    },
  ];
};
