import { IconPlus, IconX } from '@tabler/icons-react';
import { Badge, Button, Input } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A list of web addresses or app ids: each one once, added from the box, removed by its ×.
 * The server checks each one's shape when the portal is saved.
 */
export const AddressList = ({
  label,
  placeholder,
  values,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const [typed, setTyped] = useState('');
  const next = typed.trim();

  const add = () => {
    if (next && !values.includes(next)) onChange([...values, next]);

    setTyped('');
  };

  return (
    <div className="space-y-2">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((value) => (
            <Badge key={value} variant="secondary">
              {value}
              {!disabled && (
                <button
                  type="button"
                  aria-label={t('remove-value', 'Remove {{value}}', { value })}
                  className="rounded-sm hover:bg-muted"
                  onClick={() => onChange(values.filter((item) => item !== value))}
                >
                  <IconX className="size-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
      {!disabled && (
        <div className="flex gap-2">
          <Input
            aria-label={label}
            value={typed}
            placeholder={placeholder}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;

              event.preventDefault();
              add();
            }}
          />
          <Button variant="outline" disabled={!next} onClick={add}>
            <IconPlus />
            {t('add-value', 'Add')}
          </Button>
        </div>
      )}
    </div>
  );
};
