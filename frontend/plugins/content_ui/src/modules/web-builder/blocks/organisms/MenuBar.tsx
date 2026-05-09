import { useQuery } from '@apollo/client';
import { Spinner } from 'erxes-ui';
import { IconMenu2 } from '@tabler/icons-react';
import { CMS_MENU_LIST } from '~/modules/cms/graphql/queries';
import { BlockDefinition, BlockRenderProps } from '../types';

interface MenuBarProps {
  align: 'left' | 'center' | 'right';
  // Persisted in BlockInstance.contentTypeId; passed in via props.menuKind for render.
  menuKind?: string;
}

interface MenuNode {
  _id: string;
  parentId?: string;
  label?: string;
  url?: string;
  order?: number;
  kind?: string;
}

const alignClass = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const MenuBarRender = ({
  props,
  clientPortalId,
}: BlockRenderProps<MenuBarProps>) => {
  const { data, loading, error } = useQuery(CMS_MENU_LIST, {
    variables: {
      clientPortalId,
      kind: props.menuKind || undefined,
    },
    skip: !clientPortalId,
    fetchPolicy: 'cache-and-network',
  });

  const all: MenuNode[] = data?.cmsMenuList || [];
  const topLevel = all
    .filter((m) => !m.parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!clientPortalId) {
    return (
      <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
        MenuBar requires a client portal.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-destructive">
        Could not load menu: {error.message}
      </div>
    );
  }

  if (!topLevel.length) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground flex items-center gap-2">
        <IconMenu2 size={16} />
        No menu items.
      </div>
    );
  }

  return (
    <nav
      className={`flex flex-wrap items-center gap-6 py-3 ${
        alignClass[props.align || 'left']
      }`}
    >
      {topLevel.map((m) => (
        <a
          key={m._id}
          href={m.url || '#'}
          onClick={(e) => e.preventDefault()}
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          {m.label || 'Item'}
        </a>
      ))}
    </nav>
  );
};

export const menuBarBlock: BlockDefinition<MenuBarProps> = {
  key: 'organism.menuBar',
  level: 'organism',
  category: 'CMS',
  label: 'Menu bar',
  icon: IconMenu2,
  defaultProps: { align: 'left' },
  propSchema: {
    align: {
      type: 'select',
      label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    menuKind: {
      type: 'select',
      label: 'Menu kind',
      options: [
        { value: '', label: 'Any' },
        { value: 'header', label: 'Header' },
        { value: 'footer', label: 'Footer' },
        { value: 'sidebar', label: 'Sidebar' },
      ],
    },
  },
  Render: MenuBarRender,
};
