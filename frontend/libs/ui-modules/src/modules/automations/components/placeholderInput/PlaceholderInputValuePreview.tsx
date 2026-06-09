import { cn } from 'erxes-ui';
import { Fragment } from 'react';
import { getLockedExpressionRanges } from '../../utils/placeholderInputDetectionUtils';

type PlaceholderInputValuePreviewProps = {
  value: string;
  variant: 'expression' | 'fixed';
};

export const PlaceholderInputValuePreview = ({
  value,
  variant,
}: PlaceholderInputValuePreviewProps) => {
  if (!value) {
    return null;
  }

  const ranges = getLockedExpressionRanges(value);
  let cursor = 0;

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-sm px-3 py-2 pr-10 text-sm leading-5 text-foreground',
        variant === 'expression'
          ? 'min-h-[60px] whitespace-pre-wrap break-words text-base md:text-sm'
          : 'h-8 whitespace-pre',
      )}
    >
      {ranges.length === 0 ? (
        value
      ) : (
        <>
          {ranges.map((range, index) => {
            const plainText = value.slice(cursor, range.start);
            cursor = range.end;

            return (
              <Fragment key={`${range.start}-${range.end}`}>
                {plainText}
                <PlaceholderInputTokenPreview token={range.token} />
              </Fragment>
            );
          })}
          {value.slice(cursor)}
        </>
      )}
    </div>
  );
};

const PlaceholderInputTokenPreview = ({ token }: { token: string }) => {
  const isAttribute = token.startsWith('{{');

  return (
    <span
      className={cn(
        'inline rounded-sm box-decoration-clone ring-1 ring-inset',
        isAttribute
          ? 'bg-primary/10 text-primary ring-primary/15'
          : 'bg-accent text-accent-foreground ring-border',
      )}
    >
      {token}
    </span>
  );
};
