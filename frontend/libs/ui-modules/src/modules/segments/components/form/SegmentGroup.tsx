import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Card, Label } from 'erxes-ui';
import { useFieldArray } from 'react-hook-form';
import { SegmentProperty } from './SegmentProperty';
import { useSegment } from '../../context/SegmentProvider';
import { useTranslation } from 'react-i18next';
type Props = {
  parentFieldName?: `conditionSegments.${number}`;
  onRemove?: () => void;
};

export const SegmentGroup = ({ parentFieldName, onRemove }: Props) => {
  const { form, contentType } = useSegment();
  const { control } = form;
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const {
    fields: conditionFields,
    append,
    remove,
  } = useFieldArray({
    control: control,
    name: parentFieldName ? `${parentFieldName}.conditions` : 'conditions',
  });
  return (
    <Card className="bg-accent rounded-md">
      <Card.Header className="flex flex-row gap-2 items-center px-6 py-1 group [&>div]:items-center [&>div]:flex [&>div]:m-0">
        <div className="w-2/5 ">
          <Label>{t('property')}</Label>
        </div>
        <div className="w-1/5 ">
          <Label>{t('condition')}</Label>
        </div>
        <div className="w-2/5 pl-4">
          <Label>{t('value')}</Label>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove()}
            className={`opacity-0 group-hover:opacity-100 transition-opacity text-destructive`}
          >
            <IconTrash />
          </Button>
        )}
      </Card.Header>
      <Card className="mx-1 p-2 bg-background rounded-md">
        <div className="flex flex-col ">
          {(conditionFields || []).map((field, index) => (
            <div key={field.id}>
              <SegmentProperty
                index={index}
                parentFieldName={parentFieldName}
                remove={() => remove(index)}
                total={conditionFields.length}
              />
            </div>
          ))}
        </div>
        <Button
          className="w-full mt-4 font-mono uppercase font-semibold text-xs text-accent-foreground"
          variant="secondary"
          onClick={() =>
            append({
              propertyType: contentType || '',
              propertyName: '',
              propertyOperator: '',
            })
          }
        >
          <IconPlus />
          {t('add-condition')}
        </Button>
      </Card>
    </Card>
  );
};
