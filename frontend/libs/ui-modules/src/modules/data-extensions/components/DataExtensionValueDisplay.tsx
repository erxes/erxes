import { IconStarFilled } from '@tabler/icons-react';
import { cn, readImage } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionFileValue,
  IDataExtensionLinkedRecord,
  IDataExtensionLinkValue,
} from '../types';
import { formatDataExtensionValue } from '../utils/fieldDisplay';
import { DataExtensionOptionBadge } from './DataExtensionOptionBadge';

/**
 * Read-only value with the richer forms a cell can show: badges for
 * choices, stars for ratings, clickable links and files.
 */
export const DataExtensionValueDisplay = ({
  field,
  value,
  links,
  className,
}: {
  field: IDataExtensionField;
  value: DataExtensionValue;
  links?: IDataExtensionLinkedRecord[];
  className?: string;
}) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  if (value === null || value === undefined || value === '') {
    return <span className={cn('text-muted-foreground', className)}>—</span>;
  }

  switch (field.type) {
    case 'select': {
      const option = field.options?.find((candidate) => candidate.value === value);

      return option ? (
        <DataExtensionOptionBadge option={option} className={className} />
      ) : (
        <span className={className}>{String(value)}</span>
      );
    }
    case 'multiSelect':
      return (
        <span className={cn('flex flex-wrap gap-1', className)}>
          {(Array.isArray(value) ? value : []).map((item) => {
            const option = field.options?.find(
              (candidate) => candidate.value === item,
            ) || { value: String(item), label: String(item) };

            return <DataExtensionOptionBadge key={option.value} option={option} />;
          })}
        </span>
      );
    case 'rating': {
      const scale = field.settings?.scale || 5;
      const stars = typeof value === 'number' ? value : 0;

      return (
        <span
          className={cn('flex items-center gap-0.5', className)}
          aria-label={`${stars}/${scale}`}
        >
          {Array.from({ length: scale }, (_, index) => (
            <IconStarFilled
              key={index}
              aria-hidden="true"
              className={cn(
                'size-3',
                index < stars ? 'text-warning' : 'text-muted-foreground/30',
              )}
            />
          ))}
        </span>
      );
    }
    case 'url':
    case 'links': {
      const items =
        field.type === 'url'
          ? [{ url: String(value) }]
          : (value as IDataExtensionLinkValue[]);

      return (
        <span className={cn('flex flex-wrap gap-x-2', className)}>
          {items.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="truncate text-primary hover:underline"
            >
              {'label' in link && link.label ? link.label : link.url}
            </a>
          ))}
        </span>
      );
    }
    case 'files':
      return (
        <span className={cn('flex flex-wrap gap-x-2', className)}>
          {(value as IDataExtensionFileValue[]).map((file) => (
            <a
              key={file.url}
              href={readImage(file.url)}
              target="_blank"
              rel="noreferrer noopener"
              className="truncate text-primary hover:underline"
            >
              {file.name}
            </a>
          ))}
        </span>
      );
    default:
      return (
        <span className={cn('truncate', className)}>
          {formatDataExtensionValue(field, value, { locale, links })}
        </span>
      );
  }
};
