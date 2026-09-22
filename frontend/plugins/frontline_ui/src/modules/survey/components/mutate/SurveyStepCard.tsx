import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconGripVertical,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { Button, Form, InfoCard, Input, Switch, Textarea } from 'erxes-ui';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SurveyOptionTicketConfig } from '@/survey/components/mutate/SurveyOptionTicketConfig';
import { createSurveyContentOption } from '@/survey/constants/surveySetupDefaultValues';
import { TSurveyContent } from '@/survey/constants/surveySetupSchema';
import { MAX_SURVEY_OPTIONS } from '@/survey/types/surveyTypes';

export const SurveyStepCard = ({
  id,
  index,
  isMultipleSteps,
  form,
  onRemove,
}: {
  id: string;
  index: number;
  isMultipleSteps: boolean;
  form: UseFormReturn<TSurveyContent>;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { attributes, listeners, setNodeRef, transition, transform } =
    useSortable({ id });

  const {
    fields: options,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: `steps.${index}.options`,
  });

  const optionsError = form.formState.errors.steps?.[index]?.options;

  return (
    <InfoCard.Content
      ref={setNodeRef}
      style={{ transition, transform: CSS.Translate.toString(transform) }}
      className="p-0 relative gap-0"
    >
      <div className="flex items-center p-4 pb-0 gap-2">
        <Form.Field
          control={form.control}
          name={`steps.${index}.name`}
          render={({ field }) => (
            <Form.Item className="w-1/2">
              <Form.Control>
                <Input
                  {...field}
                  placeholder={`${t('survey-step', 'Step')} ${index + 1}`}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <div className="ml-auto flex items-center gap-2">
          {isMultipleSteps && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('drag-to-reorder')}
                {...attributes}
                {...listeners}
              >
                <IconGripVertical />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                aria-label={t('remove-step', 'Remove step')}
                onClick={onRemove}
              >
                <IconTrash />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <Form.Field
          control={form.control}
          name={`steps.${index}.question`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('survey-question', 'Question')}</Form.Label>
              <Form.Control>
                <Textarea
                  {...field}
                  rows={2}
                  placeholder={t(
                    'survey-question-placeholder',
                    'Ask something…',
                  )}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        {isMultipleSteps && (
          <Form.Field
            control={form.control}
            name={`steps.${index}.description`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('description')}</Form.Label>
                <Form.Control>
                  <Textarea {...field} rows={2} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}

        <div className="flex flex-col gap-2">
          <Form.Label>{t('survey-options', 'Options')}</Form.Label>
          {options.map((option, optionIndex) => (
            <Form.Field
              key={option.id}
              control={form.control}
              name={`steps.${index}.options.${optionIndex}.text`}
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-2">
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder={`${t('survey-option', 'Option')} ${
                          optionIndex + 1
                        }`}
                      />
                    </Form.Control>
                    <SurveyOptionTicketConfig
                      form={form}
                      stepIndex={index}
                      optionIndex={optionIndex}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground"
                        onClick={() => remove(optionIndex)}
                        aria-label={t('remove')}
                      >
                        <IconX />
                      </Button>
                    )}
                  </div>
                  <Form.Message />
                </Form.Item>
              )}
            />
          ))}
          {optionsError?.root && (
            <p className="text-destructive text-sm">
              {optionsError.root.message}
            </p>
          )}
          {options.length < MAX_SURVEY_OPTIONS && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit text-muted-foreground"
              onClick={() => append(createSurveyContentOption())}
            >
              <IconPlus />
              {t('add-option')}
            </Button>
          )}
        </div>

        <Form.Field
          control={form.control}
          name={`steps.${index}.allowMultiselect`}
          render={({ field }) => (
            <Form.Item className="flex items-center justify-between gap-2">
              <Form.Label>{t('allow-multiple-answers')}</Form.Label>
              <Form.Control>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>
    </InfoCard.Content>
  );
};
