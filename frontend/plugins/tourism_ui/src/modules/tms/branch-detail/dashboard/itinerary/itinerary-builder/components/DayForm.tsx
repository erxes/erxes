import { IconTrash, IconGripVertical } from '@tabler/icons-react';
import { Button, Form, Input, Editor } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useMemo } from 'react';

import { IElement } from '../../../elements/types/element';
import { IAmenity } from '../../../amenities/types/amenity';

import { ImageUploadGrid } from '../../../../components';
import { DayAmenitiesSelect } from './DayAmenitiesSelect';
import { SortableList } from './SortableList';

interface DayFormProps {
  dayIndex: number;
  control: Control<any>;
  onRemove: () => void;
  availableAmenities: IAmenity[];
  droppedElements: IElement[];
  onRemoveElement: (elementId: string) => void;
  onReorderElements: (reorderedElements: IElement[]) => void;
  labelSuffix?: string;
  currencySymbol?: string;
  daysFieldPathPrefix?: string;
  dayDescriptionKey?: string;
}

export const DayForm = ({
  dayIndex,
  control,
  onRemove,
  availableAmenities,
  droppedElements,
  onRemoveElement,
  onReorderElements,
  labelSuffix = '',
  currencySymbol = '$',
  daysFieldPathPrefix = 'groupDays',
  dayDescriptionKey = 'description',
}: DayFormProps) => {
  const dayCost = useMemo(() => {
    return droppedElements.reduce((sum, el) => sum + (el.cost || 0), 0);
  }, [droppedElements]);

  return (
    <div className="p-6 space-y-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconGripVertical
            className="cursor-move text-muted-foreground"
            size={20}
          />
          <h3 className="text-lg font-semibold">Day {dayIndex + 1}</h3>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            day cost:{' '}
            <span className="font-semibold">
              {dayCost} {currencySymbol}
            </span>
          </span>

          {dayIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-destructive"
            >
              <IconTrash size={18} />
            </Button>
          )}
        </div>
      </div>

      <Form.Field
        control={control}
        name={`${daysFieldPathPrefix}.${dayIndex}.title`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              Day Title<span className="text-primary">{labelSuffix}</span>{' '}
              <span className="text-destructive">*</span>
            </Form.Label>

            <Form.Control>
              <Input {...field} placeholder="Enter the title for this day" />
            </Form.Control>

            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <div className="border-2 border-dashed rounded-lg min-h-[120px] flex items-center justify-center">
        {droppedElements.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground">
            Please drag and drop from elements
          </p>
        ) : (
          <div className="w-full p-4">
            <SortableList
              items={droppedElements.map((el) => ({ ...el, id: el._id }))}
              onReorder={onReorderElements}
              keyExtractor={(item) => item.id}
              renderItem={(item) => (
                <div className="flex items-center w-full gap-2">
                  <span className="flex-1 min-w-0 text-sm break-all">
                    {item.name}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onRemoveElement(item._id)}
                    className="shrink-0 text-destructive"
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              )}
            />
          </div>
        )}
      </div>

      <Form.Field
        control={control}
        name={`${daysFieldPathPrefix}.${dayIndex}.${dayDescriptionKey}`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              Description for customers
              <span className="text-primary">{labelSuffix}</span>
            </Form.Label>

            <Form.Control>
              <Editor
                initialContent={field.value}
                onChange={field.onChange}
                isHTML
              />
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name={`groupDays.${dayIndex}.images`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Upload Images</Form.Label>

            <ImageUploadGrid
              value={field.value}
              onChange={field.onChange}
              maxImages={5}
              maxFileSize={20 * 1024 * 1024}
            />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name={`groupDays.${dayIndex}.amenities`}
        render={({ field }) => (
          <DayAmenitiesSelect
            field={field}
            availableAmenities={availableAmenities}
          />
        )}
      />
    </div>
  );
};
