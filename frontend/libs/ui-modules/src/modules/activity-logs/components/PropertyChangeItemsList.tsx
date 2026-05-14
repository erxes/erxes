import { Badge } from 'erxes-ui';
import { formatPropertyFieldValue } from '../utils/propertyFieldChangedActivity';

interface PropertyChangeItemsListProps {
  label: string;
  items: unknown[];
  fieldType?: string;
  options: Array<{ label?: string; value?: string }>;
}

export const PropertyChangeItemsList = ({
  label,
  items,
  fieldType,
  options,
}: PropertyChangeItemsListProps) => {
  return (
    <>
      <span className="text-muted-foreground">{label}:</span>
      <div className="ml-2 flex flex-wrap gap-1 items-center">
        {items.map((item, index) => {
          const itemLabel = formatPropertyFieldValue({
            value: item,
            fieldType,
            options,
          });

          return (
            <Badge key={index} variant="secondary">
              {itemLabel}
            </Badge>
          );
        })}
      </div>
    </>
  );
};
