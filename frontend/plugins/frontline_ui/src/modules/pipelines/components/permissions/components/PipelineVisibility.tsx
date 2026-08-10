import { Combobox, Form, PopoverScoped, ToggleGroup } from 'erxes-ui';
import { Control, useWatch } from 'react-hook-form';
import { SelectMember } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { PermissionState } from '@/pipelines/types';

interface PipelineVisibilityProps {
  control: Control<PermissionState>;
}

export const PipelineVisibility = ({ control }: PipelineVisibilityProps) => {
  const { t } = useTranslation('frontline');
  const visibility = useWatch({ control, name: 'visibility' });

  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={control}
        name="visibility"
        render={({ field }) => (
          <Form.Item className="space-y-0">
            <Form.Label className="sr-only">
              {t('pipeline-visibility')}
            </Form.Label>
            <Form.Control>
              <ToggleGroup
                className="w-fit"
                onValueChange={(value) => value && field.onChange(value)}
                type="single"
                value={field.value}
                variant="outline"
              >
                <ToggleGroup.Item className="px-4" value="public">
                  {t('public')}
                </ToggleGroup.Item>
                <ToggleGroup.Item className="px-4" value="private">
                  {t('private')}
                </ToggleGroup.Item>
              </ToggleGroup>
            </Form.Control>
          </Form.Item>
        )}
      />

      {visibility === 'private' && (
        <Form.Field
          control={control}
          name="memberIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('team-members')}</Form.Label>
              <Form.Control>
                <SelectMember.Provider
                  value={field.value || []}
                  onValueChange={(value) =>
                    field.onChange(Array.isArray(value) ? value : [])
                  }
                  mode="multiple"
                >
                  <PopoverScoped>
                    <Combobox.Trigger className="w-full">
                      <SelectMember.Value
                        placeholder={t('select-team-members')}
                      />
                    </Combobox.Trigger>
                    <Combobox.Content>
                      <SelectMember.Content />
                    </Combobox.Content>
                  </PopoverScoped>
                </SelectMember.Provider>
              </Form.Control>
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};
