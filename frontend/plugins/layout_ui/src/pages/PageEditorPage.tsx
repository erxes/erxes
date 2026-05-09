import { Link, useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';

import { Editor } from '~/modules/builder/components/Editor';
import { usePages } from '~/modules/builder/hooks/usePages';

export const PageEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { get } = usePages();
  const page = id ? get(id) : null;

  if (!page) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          We could not find a page with the id <code>{id}</code>.
        </p>
        <Button asChild>
          <Link to="/layout">Back to pages</Link>
        </Button>
      </div>
    );
  }

  return <Editor page={page} />;
};
