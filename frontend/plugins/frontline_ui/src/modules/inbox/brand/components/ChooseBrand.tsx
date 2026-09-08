import {
  Button,
  Input,
  Skeleton,
  TextOverflowTooltip,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import {
  IconBuildingStore,
  IconCheck,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useBrands } from 'ui-modules/modules/brands/hooks/useBrands';
import { useState, useRef, type ReactNode } from 'react';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import {
  CLEARED_INBOX_NAVIGATION_FILTERS,
  INBOX_NAVIGATION_FILTER_KEYS,
  TInboxNavigationFilters,
} from '@/inbox/types/InboxNavigation';
import { useIntegrations } from '@/integrations/hooks/useIntegrations';

export const ChooseBrand = () => {
  const { t } = useTranslation('frontline');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const [channelId] = useQueryState<string>('channelId');

  const { brands, loading } = useBrands({
    variables: { searchValue: debouncedSearch || undefined },
  });
  const { integrations, loading: integrationsLoading } = useIntegrations({
    variables: { channelId, limit: 100 },
    skip: !channelId,
  });
  const channelBrandIds = new Set(
    integrations?.flatMap(({ brandId }) => (brandId ? [brandId] : [])) ?? [],
  );
  const visibleBrands = channelId
    ? brands?.filter(({ _id }) => channelBrandIds.has(_id))
    : brands;

  let brandContent: ReactNode;
  if (loading || integrationsLoading) {
    brandContent = (
      <>
        <Skeleton className="w-32 h-4 mt-1" />
        <Skeleton className="w-36 h-4 mt-1" />
        <Skeleton className="w-32 h-4 mt-1" />
      </>
    );
  } else if (!visibleBrands?.length) {
    brandContent = (
      <div className="text-sm text-accent-foreground ml-1 my-2">
        {t('no-brands-found')}
      </div>
    );
  } else {
    brandContent = visibleBrands.map((brand) => (
      <BrandItem
        key={brand._id}
        _id={brand._id}
        name={brand.name ?? t('unnamed-brand')}
      />
    ));
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative mx-1">
        <IconSearch className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          variant="secondary"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 pl-6 pr-7 text-xs"
        />
        {search ? (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              inputRef.current?.focus();
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <IconX className="size-3" />
          </button>
        ) : (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/40">
            /
          </span>
        )}
      </div>
      {brandContent}
    </div>
  );
};

const BrandItem = ({ _id, name }: { _id: string; name: string }) => {
  const [{ brandId, channelId }, setFilters] =
    useMultiQueryState<TInboxNavigationFilters>(
      INBOX_NAVIGATION_FILTER_KEYS,
    );

  const isActive = brandId === _id;

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="justify-start relative overflow-hidden text-left flex-auto p-2"
      onClick={() =>
        setFilters({
          ...CLEARED_INBOX_NAVIGATION_FILTERS,
          channelId,
          brandId: isActive ? null : _id,
        })
      }
    >
      {isActive ? (
        <IconCheck className="" />
      ) : (
        <IconBuildingStore className="size-3 text-accent-foreground shrink-0" />
      )}
      <TextOverflowTooltip value={name} />
    </Button>
  );
};
