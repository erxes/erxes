import { IconTrash } from '@tabler/icons-react';
import { Button, Card, Label } from 'erxes-ui';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { SegmentFormProps } from '../../types';
import { SegmentProperty } from './SegmentProperty';
type Props = {
  form: UseFormReturn<SegmentFormProps>;
  parentFieldName?: `conditionSegments.${number}`;
  onRemove?: () => void;
  contentType: string;
};

export const SegmentGroup = ({
  form,
  parentFieldName,
  onRemove,
  contentType,
}: Props) => {
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
                form={form}
                parentFieldName={parentFieldName}
                condition={condition}
                contentType={contentType}
                remove={() => remove(index)}
                isFirst={index === 0}
                isLast={index === conditionFields.length - 1}
                total={conditionFields.length}
              />
            </div>
          ))}
        </div>
        <Button
          className="w-full mt-4"
          variant="secondary"
          onClick={() =>
            append({
              propertyType: contentType || '',
              propertyName: '',
              propertyOperator: '',
            })
          }
        >
          <Label>+ Add Condition</Label>
        </Button>
      </Card>
    </Card>
  );
};
