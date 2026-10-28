import {
  IconCurrentLocation,
  IconMapPin,
  IconSearch,
} from '@tabler/icons-react';
import { Button, Input, Spinner, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TCurrentLocation,
  TLocationSearch,
} from '../../hooks/useStructureLocationField';

type TStructureLocationSearchProps = {
  search: TLocationSearch;
  currentLocation: TCurrentLocation;
};

export const StructureLocationSearch = ({
  search,
  currentLocation,
}: TStructureLocationSearchProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    search.setQuery(event.currentTarget.value);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      search.submit();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search.query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={t('location-search-placeholder')}
            className="pl-8 pr-8"
          />
          {search.loading && (
            <Spinner className="absolute right-2.5 top-1/2 -translate-y-1/2" />
          )}
        </div>
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={t('use-current-location')}
                disabled={currentLocation.locating}
                onClick={currentLocation.locate}
              >
                {currentLocation.locating ? (
                  <Spinner size="sm" />
                ) : (
                  <IconCurrentLocation />
                )}
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>{t('use-current-location')}</Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      </div>
      {search.pasted && (
        <p className="text-xs text-primary">{t('coordinates-recognised')}</p>
      )}
      {search.results.length > 0 && (
        <div className="flex flex-col rounded-md border p-1">
          {search.results.map((result) => (
            <Button
              key={result.id}
              variant="ghost"
              className="h-auto justify-start whitespace-normal py-1.5 text-left font-normal"
              onClick={() => search.pick(result)}
            >
              <IconMapPin className="shrink-0 text-muted-foreground" />
              {result.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
