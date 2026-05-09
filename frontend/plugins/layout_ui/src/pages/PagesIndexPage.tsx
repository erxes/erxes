import {
  IconCopy,
  IconEdit,
  IconExternalLink,
  IconFileText,
  IconLayoutBoard,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  PageContainer,
  ScrollArea,
  Separator,
  cn,
  toast,
  useConfirm,
} from 'erxes-ui';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageHeader } from 'ui-modules';

import { usePages } from '~/modules/builder/hooks/usePages';
import { LayoutPage } from '~/modules/builder/types';
import { NewPageDialog } from '~/modules/builder/components/NewPageDialog';

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const PageRow = ({ page }: { page: LayoutPage }) => {
  const navigate = useNavigate();
  const { remove, duplicate } = usePages();
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    try {
      await confirm({
        message: `Delete page "${page.title}"? This cannot be undone.`,
      });
      const r = remove(page.id);
      if (r.ok) {
        toast({ title: 'Page deleted' });
      } else {
        toast({
          title: 'Could not delete',
          description: r.error,
          variant: 'destructive',
        });
      }
    } catch {
      // dismissed
    }
  };

  const handleDuplicate = () => {
    const r = duplicate(page.id);
    if (r.ok) {
      toast({ title: 'Page duplicated' });
    } else {
      toast({
        title: 'Could not duplicate',
        description: r.error ?? 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition hover:border-primary/50">
      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
        <IconFileText size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/layout/edit/${page.id}`)}
            className="truncate text-base font-semibold hover:text-primary"
          >
            {page.title}
          </button>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              page.status === 'published'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700',
            )}
          >
            {page.status}
          </span>
          <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            {page.template}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <code className="font-mono">/{page.slug}</code>
          <span>·</span>
          <span>Updated {formatDate(page.updatedAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/layout/edit/${page.id}`)}
        >
          <IconEdit size={16} />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            window.open(
              `/layout/preview/${page.id}`,
              '_blank',
              'noopener',
            )
          }
        >
          <IconExternalLink size={16} />
          Preview
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDuplicate}>
          <IconCopy size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <IconTrash size={16} />
        </Button>
      </div>
    </div>
  );
};

export const PagesIndexPage = () => {
  const { pages } = usePages();
  const [dialogOpen, setDialogOpen] = useState(false);

  const sorted = [...pages].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/layout">
                    <IconLayoutBoard />
                    Pages
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Separator.Inline />
              <span className="text-sm text-muted-foreground">
                {pages.length} {pages.length === 1 ? 'page' : 'pages'}
              </span>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <Button onClick={() => setDialogOpen(true)}>
          <IconPlus size={16} />
          New page
        </Button>
      </PageHeader>

      <PageContainer>
        <ScrollArea className="h-full flex-1">
          <div className="mx-auto w-full max-w-4xl space-y-3 p-6">
            {sorted.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed p-12 text-center">
                <h3 className="text-lg font-semibold">No pages yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first page to start building.
                </p>
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <IconPlus size={16} />
                  New page
                </Button>
              </div>
            ) : (
              sorted.map((p) => <PageRow key={p.id} page={p} />)
            )}
          </div>
        </ScrollArea>
      </PageContainer>

      <NewPageDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};
