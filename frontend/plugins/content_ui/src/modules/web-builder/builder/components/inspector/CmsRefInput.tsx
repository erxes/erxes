import { useQuery } from '@apollo/client';
import { Combobox, Command, Popover, Spinner } from 'erxes-ui';
import { useState } from 'react';
import {
  CMS_CATEGORIES,
  CMS_CUSTOM_POST_TYPES,
  CMS_MENU_LIST,
} from '~/modules/cms/graphql/queries';
import { CmsRefKind } from '../../../blocks/types';

interface Option {
  value: string;
  label: string;
}

interface CmsRefInputProps {
  kind: CmsRefKind;
  clientPortalId: string;
  value?: string;
  onChange: (value: string | undefined) => void;
}

const useOptions = (
  kind: CmsRefKind,
  clientPortalId: string,
): { options: Option[]; loading: boolean } => {
  const isCategory = kind === 'cmsCategory';
  const isMenu = kind === 'cmsMenu';
  const isPostType = kind === 'cmsCustomPostType';

  const cats = useQuery(CMS_CATEGORIES, {
    variables: { clientPortalId, limit: 100 },
    skip: !clientPortalId || !isCategory,
    fetchPolicy: 'cache-first',
  });
  const menus = useQuery(CMS_MENU_LIST, {
    variables: { clientPortalId },
    skip: !clientPortalId || !isMenu,
    fetchPolicy: 'cache-first',
  });
  const types = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId },
    skip: !clientPortalId || !isPostType,
    fetchPolicy: 'cache-first',
  });

  if (isCategory) {
    return {
      options: (cats.data?.cmsCategories?.list || []).map(
        (c: { _id: string; name?: string }) => ({
          value: c._id,
          label: c.name || c._id,
        }),
      ),
      loading: cats.loading,
    };
  }
  if (isMenu) {
    return {
      options: (menus.data?.cmsMenuList || [])
        .filter((m: { parentId?: string }) => !m.parentId)
        .map((m: { _id: string; label?: string }) => ({
          value: m._id,
          label: m.label || m._id,
        })),
      loading: menus.loading,
    };
  }
  return {
    options: (types.data?.cmsCustomPostTypes || []).map(
      (t: { _id: string; label?: string; code?: string }) => ({
        value: t._id,
        label: t.label || t.code || t._id,
      }),
    ),
    loading: types.loading,
  };
};

export const CmsRefInput = ({
  kind,
  clientPortalId,
  value,
  onChange,
}: CmsRefInputProps) => {
  const [open, setOpen] = useState(false);
  const { options, loading } = useOptions(kind, clientPortalId);

  const current = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-full shadow-xs">
        <span className={current ? '' : 'text-muted-foreground'}>
          {loading
            ? 'Loading…'
            : current
              ? current.label
              : 'Select…'}
        </span>
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search…" />
          <Command.List>
            {loading && (
              <div className="flex items-center justify-center py-3">
                <Spinner />
              </div>
            )}
            <Command.Item
              value=""
              onSelect={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              <span className="text-muted-foreground">— None —</span>
            </Command.Item>
            {options.map((opt) => (
              <Command.Item
                key={opt.value}
                value={opt.value}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
                <Combobox.Check checked={value === opt.value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
