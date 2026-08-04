import { useEffect, useMemo, useCallback } from 'react';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { DayList } from './components/DayList';
import { ElementsPanel } from './components/ElementsPanel';
import { useItineraryBuilder } from './hooks/useItineraryBuilder';
import { ItineraryCreateFormType } from '../constants/formSchema';
import { IElement } from '../../elements/types/element';
import { IAmenity } from '../../amenities/types/amenity';

interface ItineraryBuilderProps {
  control: Control<ItineraryCreateFormType>;
  setValue: UseFormSetValue<ItineraryCreateFormType>;
  watch: UseFormWatch<ItineraryCreateFormType>;
  elements: IElement[];
  amenities: IAmenity[];
  branchId?: string;
  isEditMode?: boolean;
  labelSuffix?: string;
  currencySymbol?: string;
  mainLanguage?: string;
  branchLanguages?: string[];
  daysFieldPathPrefix?: string;
  dayDescriptionKey?: string;
}

export const ItineraryBuilder = ({
  control,
  setValue,
  watch,
  elements,
  amenities,
  branchId,
  isEditMode = false,
  labelSuffix,
  currencySymbol,
  mainLanguage,
  branchLanguages,
  daysFieldPathPrefix,
  dayDescriptionKey,
}: ItineraryBuilderProps) => {
  const {
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleRemoveElement,
    handleReorderElements,
    handleAddDay,
    handleRemoveDay,
  } = useItineraryBuilder({ setValue, watch });

  const groupDays = watch('groupDays');

  useEffect(() => {
    if (!groupDays?.length && !isEditMode) {
      setValue(
        'groupDays',
        [
          {
            title: '',
            description: '',
            elements: [],
            amenities: [],
            images: [],
          },
          {
            title: '',
            description: '',
            elements: [],
            amenities: [],
            images: [],
          },
        ],
        { shouldDirty: false },
      );
    }
  }, [groupDays, setValue, isEditMode]);

  const elementsMap = useMemo(() => {
    const map = new Map<string, IElement>();
    elements.forEach((el) => map.set(el._id, el));
    return map;
  }, [elements]);

  const getDayElements = useCallback(
    (dayIndex: number): IElement[] => {
      const day = groupDays?.[dayIndex];
      if (!day?.elements) return [];

      return day.elements
        .map((id) => elementsMap.get(id))
        .filter((el): el is IElement => Boolean(el));
    },
    [groupDays, elementsMap],
  );

  const days = Array.from({ length: groupDays?.length || 0 }, (_, i) => i);

  return (
    <div className="flex h-full overflow-hidden border rounded-lg bg-background">
      <div className="h-full min-h-0 overflow-hidden border-r flex-4">
        <ElementsPanel
          elements={elements}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          branchId={branchId}
          mainLanguage={mainLanguage}
          branchLanguages={branchLanguages}
        />
      </div>

      <div className="flex flex-col h-full min-h-0 flex-6">
        <DayList
          control={control}
          days={days}
          onAddDay={handleAddDay}
          onRemoveDay={handleRemoveDay}
          availableAmenities={amenities}
          getDayElements={getDayElements}
          onRemoveElement={handleRemoveElement}
          onReorderElements={handleReorderElements}
          onDrop={handleDrop}
          isDragging={isDragging}
          labelSuffix={labelSuffix}
          currencySymbol={currencySymbol}
          daysFieldPathPrefix={daysFieldPathPrefix}
          dayDescriptionKey={dayDescriptionKey}
        />
      </div>
    </div>
  );
};
