import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Card, Label } from 'erxes-ui';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { TSegmentForm } from '../../types';
import { SegmentProperty } from './SegmentProperty';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
type Props = {
  parentFieldName?: `conditionSegments.${number}`;
  onRemove?: () => void;
};

export const SegmentGroup = ({ parentFieldName, onRemove }: Props) => {
  const { form, contentType } = useSegment();
  const { control } = form;

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
      <Card.Header className="flex flex-row gap-2 items-center px-6 py-2 group">
        <div className="w-2/5 mt-2 ">
          <Label>Property</Label>
        </div>
        <div className="w-1/5 ">
          <Label>Condition</Label>
        </div>
        <div className="w-2/5 pl-4">
          <Label>Value</Label>
        </div>
        {onRemove && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onRemove()}
            className={`opacity-0 ${'group-hover:opacity-100'} transition-opacity`}
          >
            <IconTrash />
          </Button>
        )}
      </Card.Header>
      <Card className="mx-1 p-2 bg-white rounded-md">
        <div className="flex flex-col ">
          {(conditionFields || []).map((condition, index) => (
            <div key={(condition as any).id}>
              <SegmentProperty
                index={index}
                parentFieldName={parentFieldName}
                condition={condition}
                remove={() => remove(index)}
                isFirst={index === 0}
                isLast={index === conditionFields.length - 1}
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
          Add Condition
        </Button>
      </Card>
    </Card>
  );
};
