import { Link, useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';

import { RenderTree } from '~/modules/builder/components/RenderTree';
import { usePages } from '~/modules/builder/hooks/usePages';
import { LayoutPage } from '~/modules/builder/types';

const NotFound = ({
  message,
  hint,
}: {
  message: string;
  hint?: React.ReactNode;
}) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
    <h1 className="text-3xl font-semibold">{message}</h1>
    {hint}
    <Button asChild className="mt-2">
      <Link to="/layout">Back to pages</Link>
    </Button>
  </div>
);

const PreviewLayout = ({
  page,
  draft,
}: {
  page: LayoutPage;
  draft: boolean;
}) => {
  return (
    <div
      className="min-h-screen bg-background"
      style={page.background ? { background: page.background } : undefined}
    >
      {draft && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-800">
          Draft preview · this page is not yet published
        </div>
      )}
      <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
        <RenderTree node={page.root} />
      </div>
    </div>
  );
};

export const DraftPreviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { get } = usePages();
  const page = id ? get(id) : null;

  if (!page) {
    return (
      <NotFound
        message="Page not found"
        hint={
          <p className="text-sm text-muted-foreground">
            The page may have been deleted.
          </p>
        }
      />
    );
  }

  return <PreviewLayout page={page} draft={page.status !== 'published'} />;
};

export const PublishedPreviewPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getBySlug } = usePages();
  const page = slug ? getBySlug(slug) : null;

  if (!page || page.status !== 'published') {
    return (
      <NotFound
        message="Page not published"
        hint={
          page ? (
            <p className="text-sm text-muted-foreground">
              The page exists but is still a draft.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No published page at <code>/{slug}</code>.
            </p>
          )
        }
      />
    );
  }

  return <PreviewLayout page={page} draft={false} />;
};
