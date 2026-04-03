import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { DayForm } from './DayForm';
import { IElement } from '../../../elements/types/element';
import { IAmenity } from '../../../amenities/types/amenity';
import { ItineraryCreateFormType } from '../../constants/formSchema';

interface DayListProps {
  control: Control<ItineraryCreateFormType>;
  days: number[];
  onAddDay: () => void;
  onRemoveDay: (index: number) => void;
  availableAmenities: IAmenity[];
  getDayElements: (dayIndex: number) => IElement[];
  onRemoveElement: (dayIndex: number, elementId: string) => void;
  onReorderElements: (dayIndex: number, reorderedElementIds: string[]) => void;
  onDrop: (dayIndex: number) => void;
  isDragging: boolean;
}

export const DayList = ({
  control,
  days,
  onAddDay,
  onRemoveDay,
  availableAmenities,
  getDayElements,
  onRemoveElement,
  onReorderElements,
  onDrop,
  isDragging,
}: DayListProps) => {
  return (
    <div className="flex overflow-y-auto flex-col flex-1 p-3 space-y-4 min-h-0">
      {days.map((_, index) => {
        const elements = getDayElements(index);

        return (
          <div
            key={`day-${index}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(index);
            }}
            className={`transition-all rounded-md border border-dashed ${
              isDragging ? 'border-gray-400 bg-muted/30' : 'border-transparent'
            }`}
          >
            <DayForm
              dayIndex={index}
              control={control}
              onRemove={() => onRemoveDay(index)}
              availableAmenities={availableAmenities}
              droppedElements={elements}
              onRemoveElement={(elementId) => onRemoveElement(index, elementId)}
              onReorderElements={(reordered) =>
                onReorderElements(
                  index,
                  reordered.map((el) => el._id),
                )
              }
            />
          </div>
        );
      })}

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={onAddDay}
          className="flex gap-2 items-center w-full"
        >
          <IconPlus size={18} />
          Add Day
        </Button>
      </div>
    </div>
  );
};
