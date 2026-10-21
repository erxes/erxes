import { useState } from 'react';
import { IconArrowUpRight, IconSearch } from '@tabler/icons-react';
import { Button, Input, cn } from 'erxes-ui';
import type { CredentialTemplate } from '../types';
import {
  CONNECTION_CATEGORIES,
  CONNECTION_PROVIDERS,
  categoryName,
} from '../providers';
import { ProviderLogo } from './ProviderLogo';

export function ProviderCatalog({
  templates,
  onChoose,
  compact = false,
}: {
  templates: CredentialTemplate[];
  onChoose?: (template: CredentialTemplate) => void;
  compact?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const providers = templates.filter(
    (template) =>
      Object.prototype.hasOwnProperty.call(CONNECTION_PROVIDERS, template.id) &&
      (!category || template.category === category) &&
      `${template.name} ${template.description || ''} ${categoryName(
        template.category,
      )}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );

  return (
    <section className="space-y-5" aria-label="Connection providers">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          aria-label="Search providers"
          placeholder="Find a provider…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
          maxLength={120}
        />
      </div>
      <div
        className="flex flex-wrap gap-1"
        role="group"
        aria-label="Provider category"
      >
        {[{ id: '', label: 'All providers' }, ...CONNECTION_CATEGORIES].map(
          (item) => (
            <Button
              key={item.id}
              variant={category === item.id ? 'secondary' : 'ghost'}
              size="sm"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </Button>
          ),
        )}
      </div>
      {providers.length ? (
        <div
          className={cn(
            'grid grid-cols-1 gap-3',
            !compact && 'md:grid-cols-2 xl:grid-cols-3',
          )}
        >
          {providers.map((provider) => (
            <Button
              key={provider.id}
              variant="outline"
              disabled={!onChoose}
              onClick={() => onChoose?.(provider)}
              className={cn(
                'group h-auto min-w-0 flex-col items-start justify-start gap-4 whitespace-normal rounded-xl border border-border p-5 text-left shadow-none hover:border-primary/40 hover:bg-accent/40 motion-safe:transition-colors motion-safe:duration-200',
                compact && 'flex-row items-center gap-3 p-4',
              )}
            >
              <ProviderLogo provider={provider.id} />
              <span className="flex w-full min-w-0 flex-1 flex-col">
                <span className="flex w-full items-start gap-3 text-sm font-semibold">
                  <span className="min-w-0 flex-1">{provider.name}</span>
                  <IconArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                </span>
                <span className="mt-1.5 block text-xs font-normal leading-relaxed text-muted-foreground">
                  {provider.description}
                </span>
                {!compact && (
                  <span className="mt-auto block pt-3 text-xs font-normal text-muted-foreground">
                    {categoryName(provider.category)}
                  </span>
                )}
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <div
          role="status"
          className="space-y-3 rounded-xl border border-dashed px-5 py-10 text-center"
        >
          <p className="text-sm font-medium">No providers found</p>
          <p className="text-sm text-muted-foreground">
            Try a different name or category.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setCategory('');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </section>
  );
}
