import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';
import { Control, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SortableRows, useSortableRow } from '../../../components/SortableRows';
import { TLoyaltyAccountTypeFormValues } from '../hooks/useLoyaltyAccountTypeForm';

const TierRow = ({
  id,
  index,
  control,
  onRemove,
}: {
  id: string;
  index: number;
  control: Control<TLoyaltyAccountTypeFormValues>;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('loyalty');
  const { setNodeRef, style, handle } = useSortableRow(id);

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-1">
      {handle}
      <span className="w-6 pt-2 text-xs text-muted-foreground">
        {index + 1}
      </span>
      <Form.Field
        control={control}
        name={`tiers.${index}.name`}
        render={({ field }) => (
          <Form.Item className="flex-1">
            <Form.Control>
              <Input
                {...field}
                placeholder={t('loyalty-tier-name-placeholder')}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('delete')}
        onClick={onRemove}
      >
        <IconTrash />
      </Button>
    </div>
  );
};

// `control` is passed in: the plugin's react-hook-form copy cannot read the
// context erxes-ui's Form provides.
export const LoyaltyAccountTypeTiersField = ({
  control,
}: {
  control: Control<TLoyaltyAccountTypeFormValues>;
}) => {
  const { t } = useTranslation('loyalty');
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'tiers',
  });

  return (
    <Form.Item>
      <Form.Label>{t('loyalty-tiers')}</Form.Label>
      <Form.Description>{t('loyalty-tiers-hint')}</Form.Description>
      <div className="flex flex-col gap-2">
        <SortableRows ids={fields.map(({ id }) => id)} onMove={move}>
          {fields.map((tier, index) => (
            <TierRow
              key={tier.id}
              id={tier.id}
              index={index}
              control={control}
              onRemove={() => remove(index)}
            />
          ))}
        </SortableRows>
        <Button
          type="button"
          variant="secondary"
          className="self-start"
          onClick={() => append({ name: '' })}
        >
          <IconPlus />
          {t('loyalty-tier-add')}
        </Button>
      </div>
    </Form.Item>
  );
};
