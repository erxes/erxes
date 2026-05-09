import { useQuery } from '@apollo/client';
import {
  Button,
  Dialog,
  Form,
  Input,
  Spinner,
  toast,
} from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import {
  IconArticle,
  IconEdit,
  IconPlus,
  IconTrash,
  IconWorldPlus,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CmsLayout } from '../cms/shared/CmsLayout';

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
import { GET_WEB_DETAIL } from './graphql/queries/getWebDetail';
import { useWebPages } from './hooks/useWebPages';
import { useAddWebPage } from './hooks/useAddWebPage';
import { useRemoveWebPage } from './hooks/useRemoveWebPage';
import { IWeb, IWebPage } from './types';

interface NewPageForm {
  name: string;
  slug: string;
}

const NewPageDialog = ({
  webId,
  open,
  onOpenChange,
}: {
  webId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { addWebPage, loading } = useAddWebPage(webId);
  const form = useForm<NewPageForm>({
    defaultValues: { name: '', slug: '' },
  });

  const onSubmit = async (data: NewPageForm) => {
    if (!data.name.trim()) return;

    const slug =
      (data.slug || toSlug(data.name)).trim();

    try {
      await addWebPage({
        variables: {
          input: {
            webId,
            name: data.name.trim(),
            slug,
          },
        },
      });
      form.reset({ name: '', slug: '' });
      onOpenChange(false);
    } catch {
      // toast handled inside hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>New page</Dialog.Title>
        </Dialog.Header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Form.Field
              control={form.control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="About us"
                      onChange={(e) => {
                        field.onChange(e);
                        if (!form.getValues('slug')) {
                          form.setValue('slug', toSlug(e.target.value));
                        }
                      }}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="slug"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Slug</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="about-us" />
                  </Form.Control>
                </Form.Item>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};

const PageRow = ({
  page,
  webId,
  onDelete,
}: {
  page: IWebPage;
  webId: string;
  onDelete: () => void;
}) => {
  const navigate = useNavigate();
  const itemCount = page.pageItems?.length ?? 0;

  return (
    <div className="flex items-center justify-between border rounded-md bg-card px-4 py-3 hover:border-primary transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <IconArticle size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">{page.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            /{page.slug} · {itemCount} {itemCount === 1 ? 'block' : 'blocks'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="sm"
          onClick={() =>
            navigate(`/content/web-builder/${webId}/pages/${page._id}/build`)
          }
        >
          <IconEdit className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          title="Delete"
          className="text-destructive hover:text-destructive"
        >
          <IconTrash className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export function WebDetailPage() {
  const { webId } = useParams();
  const [showAdd, setShowAdd] = useState(false);
  const { confirm } = useConfirm();
  const { removeWebPage } = useRemoveWebPage(webId || '');

  const { data: webData, loading: webLoading } = useQuery(GET_WEB_DETAIL, {
    variables: { _id: webId },
    skip: !webId,
  });

  const web: IWeb | null = webData?.getWebDetail || null;
  const { pages, loading: pagesLoading } = useWebPages(webId || '');

  if (!webId) {
    toast({
      title: 'Error',
      description: 'Missing web id.',
      variant: 'destructive',
    });
    return null;
  }

  const handleDelete = (page: IWebPage) => {
    confirm({
      message: `Delete page "${page.name}"? This cannot be undone.`,
    }).then(() => removeWebPage(page._id));
  };

  const breadcrumb = [
    {
      label: 'Web Builder',
      href: '/content/web-builder',
      icon: <IconWorldPlus />,
    },
    { label: web?.name || 'Loading…' },
  ];

  return (
    <CmsLayout
      showSidebar={false}
      breadcrumbItems={breadcrumb}
      headerActions={
        <Button onClick={() => setShowAdd(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          New page
        </Button>
      }
    >
      <div className="max-w-3xl mx-auto py-4 space-y-4">
        {webLoading || pagesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : pages.length === 0 ? (
          <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground space-y-3">
            <IconArticle size={28} className="mx-auto opacity-60" />
            <div>No pages yet for this web.</div>
            <Button onClick={() => setShowAdd(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Create your first page
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {pages.map((p) => (
              <PageRow
                key={p._id}
                page={p}
                webId={webId}
                onDelete={() => handleDelete(p)}
              />
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-4">
          <Link
            to="/content/web-builder"
            className="text-primary hover:underline"
          >
            ← Back to projects
          </Link>
        </div>
      </div>

      <NewPageDialog
        webId={webId}
        open={showAdd}
        onOpenChange={setShowAdd}
      />
    </CmsLayout>
  );
}
