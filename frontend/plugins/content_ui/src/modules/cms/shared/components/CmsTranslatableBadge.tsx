import { Badge, TextOverflowTooltip, cn } from 'erxes-ui';
import { ReactNode } from 'react';

interface CmsTranslatableBadgeProps {
  value?: string;
  // True when the selected (non-default) language has no translation, so the
  // cell is falling back to the default-language content.
  missing?: boolean;
  // Generic per-field text shown when there is nothing to display — i.e. the
  // selected language and the default language are both empty.
  placeholder: string;
  prefix?: ReactNode;
  missingVariant?: 'outline' | 'destructive';
  missingClassName?: string;
}

/**
 * Record-table cell for a translatable field. Shows the value as a secondary
 * badge, the default-language fallback in a "missing" (red) style, and the same
 * "missing" style for the placeholder shown when there is no content in either
 * the selected or default language.
 */
export const CmsTranslatableBadge = ({
  value,
  missing,
  placeholder,
  prefix,
  missingVariant = 'outline',
  missingClassName = 'text-red-500 border-red-300',
}: CmsTranslatableBadgeProps) => {
  const hasValue = !!value?.trim();

  if (!hasValue) {
    return (
      <Badge variant={missingVariant} className={cn(missingClassName)}>
        {prefix}
        {placeholder}
      </Badge>
    );
  }

  return (
    <Badge
      variant={missing ? missingVariant : 'secondary'}
      className={cn(missing && missingClassName)}
    >
      {prefix}
      <TextOverflowTooltip value={value} className="leading-normal" />
    </Badge>
  );
};
