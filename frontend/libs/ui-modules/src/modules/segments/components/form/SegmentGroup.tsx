import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Card, Label } from 'erxes-ui';
import { useFieldArray } from 'react-hook-form';
import { SegmentProperty } from './SegmentProperty';
import { useSegment } from '../../context/SegmentProvider';
import { useTranslation } from 'react-i18next';
import { SegmentGroupProvider } from '../../context/SegmentGroupProvider';
import { SegmentGroupAddButton } from './SegmentGroupAddButton';
import { TConditionFieldPath } from '../../types';

type Props = {
  parentFieldName?: `conditionSegments.${number}`;
  onRemove?: () => void;
  withoutAssociationTypes?: boolean;
};

export const SegmentGroup = ({
  parentFieldName,
  onRemove,
  withoutAssociationTypes,
}: Props) => {
  const { form } = useSegment();
  const { control } = form;
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const fieldPath: TConditionFieldPath = parentFieldName
    ? `${parentFieldName}.conditions`
    : 'conditions';
  const {
    fields: conditionFields,
    append,
    remove,
  } = useFieldArray({
    control: control,
    name: fieldPath,
  });
  return (
    <SegmentGroupProvider
      append={append}
      fieldPath={fieldPath}
      remove={remove}
      conditionFields={conditionFields}
      withoutAssociationTypes={withoutAssociationTypes}
    >
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
                <SegmentProperty index={index} />
              </div>
            ))}
          </div>
          <SegmentGroupAddButton />
        </Card>
      </Card>
    </SegmentGroupProvider>
  );
};
