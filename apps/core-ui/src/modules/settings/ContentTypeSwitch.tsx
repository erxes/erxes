import { z } from 'zod';
import type { ContentType } from '@erxes/core-contract';
import { Button, cn, useQueryState } from 'erxes-ui';

/** Customers / Companies switch for settings that exist per record type (`?type=`). */
export const useContentTypeParam = (): [ContentType, (type: ContentType) => void] => {
  const [type, setType] = useQueryState('type', z.string());

  return [
    type === 'company' ? 'company' : 'customer',
    (next) => setType(next === 'customer' ? null : next),
  ];
};

export const ContentTypeSwitch = () => {
  const [type, setType] = useContentTypeParam();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-foreground/5 p-1">
      {(
        [
          ['customer', 'Customers'],
          ['company', 'Companies'],
        ] as const
      ).map(([value, label]) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          aria-pressed={type === value}
          className={cn(
            'h-6 px-3',
            type === value && 'bg-background text-primary shadow-sm hover:bg-background',
          )}
          onClick={() => setType(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};
