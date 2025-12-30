import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  CollisionDetection,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { z } from 'zod';
import { arrayMove } from '@dnd-kit/sortable';
import { useRef, useState, useCallback, useEffect } from 'react';

type FormData = z.infer<typeof FORM_CONTENT_SCHEMA>;
type FormField = FormData['fields'][number];
type FormStep = FormData['steps'][number];

interface UseFormDragAndDropProps {
  form: UseFormReturn<FormData>;
  fields: FormField[];
  steps: FormStep[];
  fieldsByStep: Record<string, FormField[]>;
  getFirstStepId: () => string;
}

export function useFormDragAndDrop({
  form,
  fields,
  steps,
  fieldsByStep,
  getFirstStepId,
}: UseFormDragAndDropProps) {
  const { replace } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const findContainer = useCallback(
    (id: UniqueIdentifier): string | undefined => {
      const field = fields.find((f) => f.id === String(id));
      if (field) {
        return field.stepId || getFirstStepId();
      }
      const step = steps.find((s) => s.id === String(id));
      return step?.id;
    },
    [fields, steps, getFirstStepId],
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && findContainer(activeId) && steps.find((s) => s.id === String(activeId))) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => steps.some((s) => s.id === String(container.id)),
          ),
        });
      }

      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        const overContainer = findContainer(overId);
        if (overContainer) {
          const containerFields = fieldsByStep[overContainer] || [];
          if (containerFields.length > 0) {
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerFields.some((f) => f.id === String(container.id)),
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, fields, steps, fieldsByStep, findContainer],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [fields]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (overId == null || active.id === overId) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    if (!overContainer || !activeContainer || activeContainer === overContainer) {
      return;
    }

    const activeField = fields.find((f) => f.id === String(active.id));
    if (!activeField) return;

    const activeStepFields = fieldsByStep[activeContainer] || [];
    const overStepFields = fieldsByStep[overContainer] || [];
    const overField = fields.find((f) => f.id === String(overId));

    let newIndex: number;

    if (overField && overField.stepId === overContainer) {
      const overIndex = overStepFields.findIndex((f) => f.id === String(overId));
      const isBelowOverItem =
        over &&
        active.rect.current.translated &&
        active.rect.current.translated.top >
          over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overStepFields.length;
    } else {
      newIndex = overStepFields.length;
    }

    recentlyMovedToNewContainer.current = true;

    const updatedField = { ...activeField, stepId: overContainer };
    const newActiveStepFields = activeStepFields.filter(
      (f) => f.id !== String(active.id),
    );
    const newOverStepFields = [
      ...overStepFields.slice(0, newIndex),
      updatedField,
      ...overStepFields.slice(newIndex),
    ];

    const otherFields = fields.filter(
      (f) =>
        f.stepId !== activeContainer && f.stepId !== overContainer,
    );

    const allFields = [
      ...otherFields,
      ...newActiveStepFields,
      ...newOverStepFields,
    ];

    replace(allFields);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Get current fields (may have been updated by handleDragOver)
    const currentFields = form.getValues('fields');
    const activeField = currentFields.find((f) => f.id === String(active.id));
    
    if (!activeField) {
      setActiveId(null);
      return;
    }

    const firstStepId = getFirstStepId();
    const activeStepId = activeField.stepId || firstStepId;
    const currentFieldsByStep: Record<string, FormField[]> = {};
    steps.forEach((step) => {
      currentFieldsByStep[step.id] = [];
    });
    currentFields.forEach((field) => {
      const stepId = field.stepId || firstStepId;
      if (!currentFieldsByStep[stepId]) {
        currentFieldsByStep[stepId] = [];
      }
      currentFieldsByStep[stepId].push(field);
    });

    const activeStepFields = currentFieldsByStep[activeStepId] || [];
    const activeIndex = activeStepFields.findIndex((f) => f.id === String(active.id));

    if (activeIndex === -1) {
      setActiveId(null);
      return;
    }

    let overStepId: string | undefined;
    let overIndex: number | undefined;

    const overField = currentFields.find((f) => f.id === String(over.id));
    if (overField) {
      overStepId = overField.stepId || firstStepId;
      const overStepFields = currentFieldsByStep[overStepId] || [];
      overIndex = overStepFields.findIndex((f) => f.id === String(over.id));
    } else {
      const stepExists = steps.find((s) => s.id === String(over.id));
      if (stepExists) {
        overStepId = String(over.id);
        overIndex = currentFieldsByStep[overStepId]?.length || 0;
      }
    }

    if (overStepId === undefined || overIndex === undefined) {
      setActiveId(null);
      return;
    }

    // Only handle reordering within the same step
    // Cross-step movement is already handled by handleDragOver
    if (activeStepId === overStepId && activeIndex !== overIndex) {
      const reorderedStepFields = arrayMove(
        activeStepFields,
        activeIndex,
        overIndex,
      );
      
      // Rebuild all fields maintaining order from other steps
      const newFields: FormField[] = [];
      steps.forEach((step) => {
        if (step.id === activeStepId) {
          newFields.push(...reorderedStepFields);
        } else {
          const stepFields = currentFieldsByStep[step.id] || [];
          newFields.push(...stepFields);
        }
      });
      
      replace(newFields);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    recentlyMovedToNewContainer.current = false;
  };

  return {
    sensors,
    activeId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    collisionDetectionStrategy,
  };
}
