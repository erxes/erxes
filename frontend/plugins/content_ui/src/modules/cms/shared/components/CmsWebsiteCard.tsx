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
  'relative rounded-lg border bg-background transition-colors hover:border-primary/40 has-[[data-card-open]:focus-visible]:outline-2 has-[[data-card-open]:focus-visible]:outline-ring/70';

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
    <div className="relative z-10 flex shrink-0 items-center">
      {website.url && (
        <Button variant="ghost" size="icon" asChild>
          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('open-website')}
            title={t('open-website')}
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
        onClick={onManage}
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
    <div className={cn(ITEM_CLASS_NAME, 'flex flex-col gap-3 p-4')}>
      <button
        type="button"
        data-card-open
        aria-label={website.name}
        className="absolute inset-0 cursor-pointer rounded-lg outline-none"
        onClick={onOpen}
      />
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
