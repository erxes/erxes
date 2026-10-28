import { Form, Label, RadioGroup } from 'erxes-ui';
import { useId } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectStructureEntities, TStructureSeatCoverage } from 'ui-modules';
import { STRUCTURE_SEAT_COVERAGES } from '../utils/structureSeatCoverage';

type TCoverageValues = {
  coverage: TStructureSeatCoverage;
  coveredEntityIds: string[];
};

const toIds = (value?: string[] | string) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

export const StructureSeatCoverageFields = ({
  entityId,
  disabled,
}: {
  entityId: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const idPrefix = useId();
  const { control } = useFormContext<TCoverageValues>();
  const coverage = useWatch({ control, name: 'coverage' });

  return (
    <>
      <Form.Field
        control={control}
        name="coverage"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('coverage')}</Form.Label>
            <Form.Control>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
                className="flex flex-col gap-2"
              >
                {STRUCTURE_SEAT_COVERAGES.map((value) => (
                  <div key={value} className="flex items-start gap-2">
                    <RadioGroup.Item
                      id={`${idPrefix}-${value}`}
                      value={value}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`${idPrefix}-${value}`}
                      className="flex flex-col gap-0.5 font-normal"
                    >
                      <span>{t(`coverage-${value}`)}</span>
                      <span className="text-xs text-muted-foreground">
                        {t(`coverage-${value}-description`)}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      {coverage === 'selected' && (
        <Form.Field
          control={control}
          name="coveredEntityIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('covered-nodes')}</Form.Label>
              <SelectStructureEntities.FormItem
                mode="multiple"
                value={field.value}
                descendantOf={entityId}
                excludeIds={[entityId]}
                placeholder={t('select-covered-nodes')}
                onValueChange={(value) => field.onChange(toIds(value))}
              />
              <Form.Description>
                {t('covered-nodes-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </>
  );
};
