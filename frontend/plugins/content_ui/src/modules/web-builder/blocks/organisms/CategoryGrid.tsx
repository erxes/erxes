import { useQuery } from '@apollo/client';
import { Spinner } from 'erxes-ui';
import { IconCategory } from '@tabler/icons-react';
import { CMS_CATEGORIES } from '~/modules/cms/graphql/queries';
import { BlockDefinition, BlockRenderProps } from '../types';

interface CategoryGridProps {
  title: string;
  limit: number;
}

interface CategoryNode {
  _id: string;
  name?: string;
  description?: string;
  slug?: string;
}

const CategoryGridRender = ({
  props,
  clientPortalId,
}: BlockRenderProps<CategoryGridProps>) => {
  const { data, loading, error } = useQuery(CMS_CATEGORIES, {
    variables: {
      clientPortalId,
      limit: props.limit || 6,
    },
    skip: !clientPortalId,
    fetchPolicy: 'cache-and-network',
  });

  const categories: CategoryNode[] = data?.cmsCategories?.list || [];

  if (!clientPortalId) {
    return (
      <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
        CategoryGrid requires a client portal.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-dashed p-6 text-sm text-destructive">
        Could not load categories: {error.message}
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground flex items-center gap-2">
        <IconCategory size={16} />
        No categories yet.
      </div>
    );
  }

  return (
    <section className="space-y-5">
      {props.title && (
        <h2 className="text-2xl font-semibold tracking-tight">{props.title}</h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.slice(0, props.limit || 6).map((c) => (
          <a
            key={c._id}
            href={`#/${c.slug || c._id}`}
            onClick={(e) => e.preventDefault()}
            className="rounded-md border bg-card p-5 hover:border-primary transition-colors"
          >
            <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-3">
              <IconCategory size={20} />
            </div>
            <div className="font-semibold">{c.name || 'Untitled'}</div>
            {c.description && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {c.description}
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
};

export const categoryGridBlock: BlockDefinition<CategoryGridProps> = {
  key: 'organism.categoryGrid',
  level: 'organism',
  category: 'CMS',
  label: 'Category grid',
  icon: IconCategory,
  defaultProps: {
    title: 'Browse by category',
    limit: 8,
  },
  propSchema: {
    title: { type: 'text', label: 'Section title' },
    limit: { type: 'number', label: 'Max categories', min: 1, max: 24 },
  },
  Render: CategoryGridRender,
};
