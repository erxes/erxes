import {
  IconCircleCheckFilled,
  IconExternalLink,
  IconPlus,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import type { ReactNode } from 'react';

export type TTemplateRequirementOption = {
  value: string;
  label: string;
  description?: string;
  imageUrl?: string;
  icon?: ReactNode;
};

// A list this short reads better as cards than as a dropdown
export const TEMPLATE_REQUIREMENT_CARD_LIMIT = 6;

const CARD_CLASS =
  'flex min-h-16 min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

/**
 * A template requirement's choices as cards, with making a new one as the
 * last card: in place through `onCreate`, or in a new tab through
 * `createHref` when the form is too big for the wizard.
 */
export const TemplateRequirementOptions = ({
  options,
  value,
  onSelect,
  createLabel,
  onCreate,
  createHref,
}: {
  options: TTemplateRequirementOption[];
  value?: string;
  onSelect: (value: string) => void;
  createLabel?: string;
  onCreate?: () => void;
  createHref?: string;
}) => {
  const createContent = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed">
        {createHref ? (
          <IconExternalLink className="size-4" />
        ) : (
          <IconPlus className="size-4" />
        )}
      </span>
      <span className="truncate text-sm font-medium">{createLabel}</span>
    </>
  );
  const createClassName = cn(
    CARD_CLASS,
    'border-dashed text-muted-foreground hover:border-primary/40 hover:text-primary',
  );

  return (
    <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(option.value)}
            className={cn(
              CARD_CLASS,
              'bg-background hover:border-primary/40 hover:bg-primary/5',
              isSelected && 'border-primary bg-primary/5 ring-1 ring-primary',
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
              {option.imageUrl ? (
                <img
                  src={option.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                option.icon
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">
                {option.label}
              </span>
              {option.description && (
                <span className="truncate text-xs text-muted-foreground">
                  {option.description}
                </span>
              )}
            </span>
            {isSelected && (
              <IconCircleCheckFilled className="size-5 shrink-0 text-primary" />
            )}
          </button>
        );
      })}

      {createHref && (
        <a
          href={createHref}
          target="_blank"
          rel="noreferrer"
          className={createClassName}
        >
          {createContent}
        </a>
      )}
      {!createHref && onCreate && (
        <button type="button" onClick={onCreate} className={createClassName}>
          {createContent}
        </button>
      )}
    </div>
  );
};
