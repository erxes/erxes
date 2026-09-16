import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, InfoCard } from 'erxes-ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormValueEffectComponent } from '@/forms/components/FormValueEffectComponent';
import {
  createSurveyContentDefaultValues,
  createSurveyContentStep,
} from '@/survey/constants/surveySetupDefaultValues';
import {
  SURVEY_CONTENT_SCHEMA,
  TSurveyContent,
} from '@/survey/constants/surveySetupSchema';
import { SurveyMutateLayout } from '@/survey/components/mutate/SurveyMutateLayout';
import { SurveyStepCard } from '@/survey/components/mutate/SurveyStepCard';
import { surveySetupContentAtom } from '@/survey/states/surveySetupStates';
import { MAX_SURVEY_STEPS } from '@/survey/types/surveyTypes';

export const SurveyContent = () => {
  const { t } = useTranslation('frontline');
  const form = useForm<TSurveyContent>({
    resolver: zodResolver(SURVEY_CONTENT_SCHEMA),
    defaultValues: createSurveyContentDefaultValues(),
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const from = fields.findIndex((field) => field.id === active.id);
    const to = fields.findIndex((field) => field.id === over.id);

    if (from !== -1 && to !== -1) {
      move(from, to);
    }
  };

  return (
    <SurveyMutateLayout
      title={t('content-label')}
      description={t(
        'survey-content-description',
        'Add the questions this survey asks, one step at a time',
      )}
      form={form}
    >
      <FormValueEffectComponent form={form} atom={surveySetupContentAtom} />
      <InfoCard
        title={t('survey-steps', 'Steps')}
        description={t('drag-to-reorder-steps', 'Drag to reorder steps')}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="inline-grid grid-flow-row gap-2 w-full">
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <SurveyStepCard
                  key={field.id}
                  id={field.id}
                  index={index}
                  isMultipleSteps={fields.length > 1}
                  form={form}
                  onRemove={() => remove(index)}
                />
              ))}
            </SortableContext>
            {fields.length < MAX_SURVEY_STEPS && (
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-lg shadow-none border-dashed border"
                onClick={() => append(createSurveyContentStep())}
              >
                <IconPlus /> {t('add-step')}
              </Button>
            )}
          </div>
        </DndContext>
      </InfoCard>
    </SurveyMutateLayout>
  );
};
