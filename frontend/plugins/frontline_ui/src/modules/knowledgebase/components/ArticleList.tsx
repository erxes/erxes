import { Button, Checkbox, CommandBar, RecordTable, Separator, useConfirm } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useMutation } from '@apollo/client';
import { REMOVE_ARTICLE } from '../graphql/mutations';
import { 
  IconFileText, 
  IconUser, 
  IconCalendar, 
  IconEye,
  IconPlus
} from '@tabler/icons-react';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

interface ArticleListProps {
  onEditArticle: (article: any) => void;
  onCreateArticle: () => void;
}

export function ArticleList({ onEditArticle, onCreateArticle }: ArticleListProps) {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') || '';

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const { confirm } = useConfirm();

  // API hook
  const { articles, loading, refetch } = useArticles({ categoryIds: [categoryId] });
  
  // Remove article mutation
  const [removeArticle] = useMutation(REMOVE_ARTICLE);

  // Derived state (no setState, no useEffect)
  const articleList = useMemo(() => articles ?? [], [articles]);

  // Create article
  const handleCreateArticle = () => {
    onEditArticle(null);
  };

  const handleEditArticle = (article: any) => {
    onEditArticle(article);
  };

  // Article columns definition
  const articleColumns = [
    RecordTable.checkboxColumn,
    {
      id: 'title',
      accessorKey: 'title',
      size: 220,
      header: () => <RecordTable.InlineHead icon={IconFileText} label="Name" />,
      cell: ({ row }: any) => (
        <div 
          className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-accent rounded p-1 -m-1"
          onClick={() => handleEditArticle(row.original)}
        >
          <div>
            <div className="font-semibold opacity-80 ml-2">{row.original?.title || 'Untitled'}</div>
            {/* {row.original?.summary && (
              <div className="mt-1 text-xs opacity-70 line-clamp-1">{row.original.summary}</div>
            )} */}
          </div>
        </div>
      ),
    },
  {
    id: 'status',
    accessorKey: 'status',
    size: 220,
    header: () => <RecordTable.InlineHead icon={IconEye} label="Status" />,
    cell: ({ row }: any) => {
      const status = String(row.original?.status || 'unknown').toLowerCase();
      const isPublished = status.includes('publish');
      const isDraft = status.includes('draft');
      const isArchived = status.includes('archived');

      let statusColor = 'text-gray-600';
      let bgColor = 'bg-gray-100';
      
      if (isPublished) {
        statusColor = 'text-green-600';
        bgColor = 'bg-green-100';
      } else if (isDraft) {
        statusColor = 'text-blue-600';
        bgColor = 'bg-blue-100';
      } else if (isArchived) {
        statusColor = 'text-red-600';
        bgColor = 'bg-red-100';
      }

      return (
        <div className="flex items-center gap-2">      
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ml-2 ${bgColor} ${statusColor}`}>
            {row.original?.status || 'unknown'}
          </span>
        </div>
      );
    },
  },
  {
    id: 'createdUser',
    accessorKey: 'createdUser',
    size: 220,
    header: () => <RecordTable.InlineHead icon={IconUser} label="Owner" />,
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2 opacity-80 ml-2">
        {row.original?.createdUser?.username || '-'}
      </div>
    ),
  },
  {
    id: 'createdDate',
    accessorKey: 'createdDate',
    size: 180,
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Created" />,
    cell: ({ row }: any) => {
      const createdDate = row.original?.createdDate;
      if (!createdDate) return <div className="opacity-80 ml-2">-</div>;
      
      try {
        const date = new Date(createdDate);
        return (
          <div className="opacity-80 ml-2">
            {date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        );
      } catch (error) {
        return <div className="opacity-80 ml-2">Invalid date</div>;
      }
    },
  },
];

  // Filter + search
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return articleList.filter((a: any) => {
      const title = String(a?.title || '').toLowerCase();
      const summary = String(a?.summary || '').toLowerCase();
      const textOk = query ? `${title} ${summary}`.includes(query) : true;

      const st = String(a?.status || '').toLowerCase();
      const statusOk =
        status === 'all' 
          ? true 
          : status === 'draft' 
            ? st.includes('draft')
            : status === 'published'
              ? st.includes('publish')
              : status === 'archived'
                ? st.includes('archived')
                : true;

      return textOk && statusOk;
    });
  }, [articleList, q, status]);

  // Command bar for bulk actions
  const ArticleCommandBar = () => {
    const { table } = RecordTable.useRecordTable();
    
    const selectedArticles = table.getFilteredSelectedRowModel().rows;
    const articleIds = selectedArticles.map(row => row.original._id);
    
    const handleEdit = () => {
      if (selectedArticles.length === 1) {
        const article = selectedArticles[0].original;
        onEditArticle(article);
      }
    };
    
    const handleDelete = async () => {
      if (articleIds.length === 0) return;
      
      const message = `Are you sure you want to delete ${articleIds.length} article${articleIds.length > 1 ? 's' : ''}? This action cannot be undone.`;
      
      const confirmOptions = {
        confirmationValue: 'delete',
        description: 'This action is permanent and cannot be undone.',
      };

      try {
        await confirm({
          message,
          options: confirmOptions,
        });

        // Delete all selected articles
        await Promise.all(
          articleIds.map(id => 
            removeArticle({ variables: { _id: id } })
          )
        );
        
        // Refetch to update the list
        refetch();
      } catch (error) {
        console.error('Error deleting articles:', error);
      }
    };
    
    return (
      <CommandBar open={selectedArticles.length > 0}>
        <CommandBar.Bar>
          <CommandBar.Value>
            {selectedArticles.length} selected
          </CommandBar.Value>
          <Separator.Inline />
          <button
            onClick={handleEdit}
            disabled={selectedArticles.length !== 1}
            className="inline-flex items-center justify-center gap-2 px-3 whitespace-nowrap rounded text-sm transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 font-medium bg-accent text-foreground hover:bg-border h-7 py-1"
          >
            Edit
          </button>
          <Separator.Inline />
          <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center gap-2 px-3 whitespace-nowrap rounded text-sm transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 font-medium bg-accent hover:bg-border h-7 py-1 text-destructive"
          >
            Delete
          </button>
        </CommandBar.Bar>
      </CommandBar>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-[320px] flex-1 items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            placeholder="Search..."
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`h-10 rounded-lg border px-4 text-sm ${status === 'all' ? 'font-semibold' : 'opacity-70'}`}
            onClick={() => setStatus('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`h-10 rounded-lg border px-4 text-sm ${status === 'draft' ? 'font-semibold' : 'opacity-70'}`}
            onClick={() => setStatus('draft')}
          >
            Draft
          </button>
          <button
            type="button"
            className={`h-10 rounded-lg border px-4 text-sm ${status === 'published' ? 'font-semibold' : 'opacity-70'}`}
            onClick={() => setStatus('published')}
          >
            Published
          </button>
          <button
            type="button"
            className={`h-10 rounded-lg border px-4 text-sm ${status === 'archived' ? 'font-semibold' : 'opacity-70'}`}
            onClick={() => setStatus('archived')}
          >
            Archived
          </button>

          <div className="ml-1 rounded-lg border px-3 py-2 text-sm opacity-70">
            {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
          </div>
        </div>       
      </div>

      {filtered.length === 0 ? (
        <div className="px-3 py-14 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <IconFileText className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-base font-semibold mb-2">
            {q.trim()
              ? `No results found for "${q}"`
              : 'No articles in this category'}
          </div>
          <div className="mt-1 text-sm opacity-70 mb-4">
            {q.trim()
              ? 'Try adjusting your search terms or filters.'
              : 'Create your first article to get started with this category.'}
          </div>       
        </div>
      ) : (
        <RecordTable.Provider 
          columns={articleColumns} 
          data={filtered} 
          stickyColumns={['checkbox']}
        >
          <ArticleCommandBar />
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              {loading ? <RecordTable.RowSkeleton rows={10} /> : <RecordTable.RowList />}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Provider>
      )}
    </div>
  );
}