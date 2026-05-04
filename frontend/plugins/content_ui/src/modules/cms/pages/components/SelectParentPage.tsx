import {
  Badge,
  cn,
  Combobox,
  Command,
  Form,
  Popover,
  SelectTree,
  TextOverflowTooltip,
} from 'erxes-ui';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@apollo/client';
import { PAGE_LIST } from '../graphql/queries/pagesListQueries';

// --- Types ---

interface IRawPage {
  _id: string;
  name?: string;
  parentId?: string;
}

interface IPageItem {
  _id: string;
  name: string;
  parentId?: string;
  order: string;
  hasChildren: boolean;
}

interface ISelectParentPageContext {
  selectedPage: IPageItem | null;
  value?: string;
  onSelect: (page: IPageItem | null) => void;
  currentPageId?: string;
}

// --- Context ---

const SelectParentPageContext = createContext<ISelectParentPageContext | null>(
  null,
);

const useSelectParentPageContext = () => {
  const ctx = useContext(SelectParentPageContext);
  if (!ctx)
    throw new Error(
      'useSelectParentPageContext must be used within SelectParentPageProvider',
    );
  return ctx;
};

// --- Utilities ---

const buildTree = (rawPages: IRawPage[]): IPageItem[] => {
  const childrenMap = new Map<string, IRawPage[]>();
  const roots: IRawPage[] = [];

  rawPages.forEach((p) => {
    if (p.parentId && rawPages.some((r) => r._id === p.parentId)) {
      const siblings = childrenMap.get(p.parentId) || [];
      siblings.push(p);
      childrenMap.set(p.parentId, siblings);
    } else {
      roots.push(p);
    }
  });

  const childSet = new Set(
    rawPages.filter((p) => p.parentId).map((p) => p.parentId),
  );

  const result: IPageItem[] = [];

  const walk = (items: IRawPage[], parentOrder: string) => {
    items.forEach((item, index) => {
      const order = parentOrder
        ? `${parentOrder}/${String(index + 1).padStart(4, '0')}`
        : String(index + 1).padStart(4, '0');

      result.push({
        _id: item._id,
        name: item.name || '',
        parentId: item.parentId,
        order,
        hasChildren: childSet.has(item._id),
      });

      const children = childrenMap.get(item._id);
      if (children) {
        walk(children, order);
      }
    });
  };

  walk(roots, '');
  return result;
};

// --- Hook ---

const useParentPages = (websiteId: string, search?: string) => {
  const { data, loading, error } = useQuery(PAGE_LIST, {
    variables: {
      clientPortalId: websiteId,
      limit: 100,
      searchValue: search || undefined,
    },
    skip: !websiteId,
    fetchPolicy: 'cache-and-network',
  });

  const pages: IPageItem[] = useMemo(() => {
    const rawPages: IRawPage[] = data?.cmsPageList?.pages || [];
    return buildTree(rawPages);
  }, [data]);

  const totalCount: number = data?.cmsPageList?.totalCount || 0;

  return { pages, loading, error, totalCount };
};

// --- Provider ---

const SelectParentPageProvider = ({
  children,
  value,
  onValueChange,
  currentPageId,
  initialPage,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  currentPageId?: string;
  initialPage?: IPageItem | null;
}) => {
  const [selectedPage, setSelectedPage] = useState<IPageItem | null>(
    initialPage || null,
  );

  useEffect(() => {
    setSelectedPage(initialPage || null);
  }, [initialPage]);

  const handleSelect = useCallback(
    (page: IPageItem | null) => {
      setSelectedPage(page);
      onValueChange?.(page?._id || '');
    },
    [onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      selectedPage,
      value,
      onSelect: handleSelect,
      currentPageId,
    }),
    [selectedPage, value, handleSelect, currentPageId],
  );

  return (
    <SelectParentPageContext.Provider value={contextValue}>
      {children}
    </SelectParentPageContext.Provider>
  );
};

// --- Item ---

const SelectParentPageItem = ({ page }: { page: IPageItem }) => {
  const { onSelect, value, currentPageId } = useSelectParentPageContext();
  const isSelected = value === page._id;
  const isCurrent = currentPageId === page._id;

  return (
    <SelectTree.Item
      key={page._id}
      _id={page._id}
      name={page.name}
      order={page.order}
      hasChildren={false}
      selected={isSelected}
      onSelect={() => {
        if (isCurrent) return;
        onSelect(page);
      }}
      className={cn(isCurrent && 'opacity-50 cursor-not-allowed')}
    >
      <TextOverflowTooltip
        value={page.name}
        className="flex-auto w-auto font-medium"
      />
      {isCurrent && <Badge className="ml-auto text-xs shrink-0">Current</Badge>}
    </SelectTree.Item>
  );
};

// --- Command ---

const NoneOption = () => {
  const { onSelect, value } = useSelectParentPageContext();
  return (
    <Command.Item
      onSelect={() => onSelect(null)}
      className={cn(
        'py-0 items-center flex-1 overflow-hidden justify-start',
        !value && 'text-primary',
      )}
    >
      <span className="font-medium">None</span>
      <Combobox.Check checked={!value} />
    </Command.Item>
  );
};

const PageTreeList = ({
  pages,
  search,
}: {
  pages: IPageItem[];
  search: string;
}) => (
  <SelectTree.Provider id="select-parent-page" ordered={!search}>
    <NoneOption />
    {pages.map((page) => (
      <SelectParentPageItem key={page._id} page={page} />
    ))}
  </SelectTree.Provider>
);

const SelectParentPageCommand = ({ websiteId }: { websiteId: string }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const { pages, loading, error } = useParentPages(websiteId, debouncedSearch);

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search pages"
        focusOnMount
      />
      <Command.List>
        <Combobox.Empty loading={loading} error={error} />
        <PageTreeList pages={pages} search={search} />
      </Command.List>
    </Command>
  );
};

// --- Content ---

const SelectParentPageContent = ({ websiteId }: { websiteId: string }) => {
  return <SelectParentPageCommand websiteId={websiteId} />;
};

// --- Value Display ---

const SelectParentPageValue = ({ pages }: { pages?: IPageItem[] }) => {
  const { value, selectedPage } = useSelectParentPageContext();

  if (!value) {
    return <Combobox.Value placeholder="Select parent page" />;
  }

  const page = selectedPage || pages?.find((p) => p._id === value);

  if (page) {
    return (
      <span className="flex items-center gap-2 font-medium truncate">
        {page.name}
      </span>
    );
  }

  return <Combobox.Value placeholder="Select parent page" />;
};

// --- FormItem ---

const FormItemPopover = ({
  pages,
  websiteId,
  className,
  open,
  onOpenChange,
}: {
  pages: IPageItem[];
  websiteId: string;
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <Form.Control>
      <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
        <SelectParentPageValue pages={pages} />
      </Combobox.Trigger>
    </Form.Control>
    <Combobox.Content>
      <SelectParentPageContent websiteId={websiteId} />
    </Combobox.Content>
  </Popover>
);

const SelectParentPageFormItem = ({
  onValueChange,
  value,
  websiteId,
  currentPageId,
  className,
}: {
  onValueChange?: (value: string) => void;
  value?: string;
  websiteId: string;
  currentPageId?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { pages } = useParentPages(websiteId);

  const initialPage = useMemo(
    () => (value ? pages.find((p) => p._id === value) || null : null),
    [value, pages],
  );

  return (
    <SelectParentPageProvider
      onValueChange={(val) => {
        onValueChange?.(val);
        setOpen(false);
      }}
      value={value}
      currentPageId={currentPageId}
      initialPage={initialPage}
    >
      <FormItemPopover
        pages={pages}
        websiteId={websiteId}
        className={className}
        open={open}
        onOpenChange={setOpen}
      />
    </SelectParentPageProvider>
  );
};

// --- Compound export ---

export const SelectParentPage = Object.assign(SelectParentPageProvider, {
  Content: SelectParentPageContent,
  Command: SelectParentPageCommand,
  Item: SelectParentPageItem,
  Value: SelectParentPageValue,
  FormItem: SelectParentPageFormItem,
});
