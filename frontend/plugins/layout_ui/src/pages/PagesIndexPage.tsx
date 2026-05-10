import {
  IconCopy,
  IconEdit,
  IconExternalLink,
  IconFileText,
  IconLayoutBoard,
  IconLayoutGrid,
  IconLayoutSidebar,
  IconRocket,
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
import { PageHeader } from 'ui-modules';

import { usePages } from '~/modules/builder/hooks/usePages';
import { LayoutPage, PageTemplate } from '~/modules/builder/types';

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

type TemplateTile = {
  template: PageTemplate;
  label: string;
  description: string;
  icon: React.ElementType;
};

const TEMPLATE_TILES: TemplateTile[] = [
  {
    template: 'blank',
    label: 'Blank',
    description: 'Empty canvas. Drop anything.',
    icon: IconFileText,
  },
  {
    template: 'with-header',
    label: 'With header',
    description: 'Heading + paragraph to start writing.',
    icon: IconLayoutBoard,
  },
  {
    template: 'with-sidebar',
    label: 'With sidebar',
    description: 'Stat cards in a 2-column grid.',
    icon: IconLayoutSidebar,
  },
  {
    template: 'landing',
    label: 'Landing',
    description: 'Hero, features grid and footer.',
    icon: IconRocket,
  },
];

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
            window.open(`/layout/preview/${page.id}`, '_blank', 'noopener')
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

const TemplateButton = ({ tile }: { tile: TemplateTile }) => {
  const navigate = useNavigate();
  const { create } = usePages();
  const Icon = tile.icon;

  const handleClick = () => {
    const r = create({ title: 'Untitled', template: tile.template });
    if (!r.ok || !r.page) {
      toast({
        title: 'Could not create page',
        description: r.error ?? 'Unknown error',
        variant: 'destructive',
      });
      return;
    }
    navigate(`/layout/edit/${r.page.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col items-start gap-3 rounded-lg border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon size={20} />
      </div>
      <div>
        <div className="text-sm font-semibold">{tile.label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {tile.description}
        </div>
      </div>
    </button>
  );
};

export const PagesIndexPage = () => {
  const { pages } = usePages();

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
      </PageHeader>

      <PageContainer>
        <ScrollArea className="h-full flex-1">
          <div className="mx-auto w-full max-w-4xl space-y-8 p-6">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <IconLayoutGrid size={18} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold">Start a new page</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {TEMPLATE_TILES.map((tile) => (
                  <TemplateButton key={tile.template} tile={tile} />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <IconFileText size={18} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold">Your pages</h2>
              </div>
              {sorted.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No pages yet. Pick a template above to start building.
                </div>
              ) : (
                <div className="space-y-3">
                  {sorted.map((p) => (
                    <PageRow key={p.id} page={p} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </PageContainer>
    </div>
  );
};
