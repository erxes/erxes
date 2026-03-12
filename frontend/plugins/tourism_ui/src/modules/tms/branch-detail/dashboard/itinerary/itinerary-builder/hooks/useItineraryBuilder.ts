import { useState, useCallback, useMemo } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { IElement } from '../../../elements/types/element';
import { ItineraryCreateFormType } from '../../constants/formSchema';

interface UseItineraryBuilderProps {
  setValue: UseFormSetValue<ItineraryCreateFormType>;
  watch: UseFormWatch<ItineraryCreateFormType>;
}

export const useItineraryBuilder = ({
  setValue,
  watch,
}: UseItineraryBuilderProps) => {
  const [draggedElement, setDraggedElement] = useState<IElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const watchedGroupDays = watch('groupDays');
  const groupDays = useMemo(() => watchedGroupDays || [], [watchedGroupDays]);

  const handleDragStart = useCallback((element: IElement) => {
    setDraggedElement(element);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (dayIndex: number) => {
      if (!draggedElement) return;

      const currentDay = groupDays[dayIndex] || {
        title: '',
        description: '',
        elements: [],
        amenities: [],
        images: [],
      };

      const currentElements = currentDay.elements || [];

      if (!currentElements.includes(draggedElement._id)) {
        const updatedElements = [...currentElements, draggedElement._id];

        setValue(`groupDays.${dayIndex}.elements`, updatedElements);
      }

      setDraggedElement(null);
      setIsDragging(false);
    },
    [draggedElement, groupDays, setValue],
  );

  const handleRemoveElement = useCallback(
    (dayIndex: number, elementId: string) => {
      const currentDay = groupDays[dayIndex];
      if (!currentDay) return;

      const updatedElements = (currentDay.elements || []).filter(
        (id) => id !== elementId,
      );

      setValue(`groupDays.${dayIndex}.elements`, updatedElements);
    },
    [groupDays, setValue],
  );

  const handleAddDay = useCallback(() => {
    const newDay = {
      title: '',
      description: '',
      elements: [],
      amenities: [],
      images: [],
    };

    setValue('groupDays', [...groupDays, newDay]);
  }, [groupDays, setValue]);

  const handleRemoveDay = useCallback(
    (dayIndex: number) => {
      const updatedDays = groupDays.filter((_, index) => index !== dayIndex);
      setValue('groupDays', updatedDays);
    },
    [groupDays, setValue],
  );

  return {
    draggedElement,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleRemoveElement,
    handleAddDay,
    handleRemoveDay,
  };
};
