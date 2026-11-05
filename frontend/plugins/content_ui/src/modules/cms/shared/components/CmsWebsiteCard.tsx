import { IconArrowUpRight, IconLock, IconSettings } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IWebsite } from '../../types';
import { getCmsDefaultLanguage } from '../utils';

interface CmsWebsiteItemProps {
  website: IWebsite;
  restricted: boolean;
  onOpen: () => void;
  onManage: () => void;
}

const ITEM_CLASS_NAME =
  'cursor-pointer rounded-lg border bg-background transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring/70';

const formatCreatedAt = (createdAt: string) =>
  new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const getCmsWebsiteLanguages = (website: IWebsite) => {
  const defaultLanguage = getCmsDefaultLanguage(website);
  const others = (website.languages || []).filter(
    (language) => language !== defaultLanguage,
  );

  return [defaultLanguage, ...others].join(' · ').toUpperCase();
};

const openOnKey =
  (onOpen: () => void) => (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

const CmsWebsiteMark = ({ name }: { name: string }) => (
  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-medium uppercase text-foreground">
    {name.trim().charAt(0) || '?'}
  </div>
);

const CmsWebsiteTitle = ({
  website,
  restricted,
}: {
  website: IWebsite;
  restricted: boolean;
}) => {
  const { t } = useTranslation('content');

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 items-center gap-1.5">
        <h3 className="truncate text-sm font-medium text-foreground">
          {website.name}
        </h3>
        {restricted && (
          <IconLock
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-label={t('restricted')}
          />
        )}
      </div>
      {website.domain && (
        <span className="truncate text-xs text-muted-foreground">
          {website.domain}
        </span>
      )}
    </div>
  );
};

const CmsWebsiteActions = ({
  website,
  onManage,
}: {
  website: IWebsite;
  onManage: () => void;
}) => {
  const { t } = useTranslation('content');

  return (
    <div className="flex shrink-0 items-center">
      {website.url && (
        <Button variant="ghost" size="icon" asChild>
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            <IconArrowUpRight />
          </a>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        aria-label={t('manage')}
        title={t('manage')}
        onClick={(event) => {
          event.stopPropagation();
          onManage();
        }}
      >
        <IconSettings />
      </Button>
    </div>
  );
};

export const CmsWebsiteCard = ({
  website,
  restricted,
  onOpen,
  onManage,
}: CmsWebsiteItemProps) => {
  const { t } = useTranslation('content');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={openOnKey(onOpen)}
      className={cn(ITEM_CLASS_NAME, 'flex flex-col gap-3 p-4')}
    >
      <div className="flex items-center gap-3">
        <CmsWebsiteMark name={website.name} />
        <CmsWebsiteTitle website={website} restricted={restricted} />
        <CmsWebsiteActions website={website} onManage={onManage} />
      </div>

      <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
        {website.description || t('no-description-available')}
      </p>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate">{getCmsWebsiteLanguages(website)}</span>
        <span className="shrink-0">{formatCreatedAt(website.createdAt)}</span>
      </div>
    </div>
  );
};
