import { Badge, cn } from 'erxes-ui';
import { IField } from '../types/fieldsTypes';

type TFieldOption = NonNullable<IField['options']>[number];

// A record keeps an option archived after it chose it, so it says so.
export const OptionLabel = ({ option }: { option: TFieldOption }) => (
  <span className="inline-flex items-center gap-1">
    <span
      className={cn(option.deprecated && 'text-muted-foreground line-through')}
    >
      {option.label}
    </span>
    {option.deprecated && (
      <Badge variant="secondary" className="no-underline">
        Archived
      </Badge>
    )}
  </span>
);
