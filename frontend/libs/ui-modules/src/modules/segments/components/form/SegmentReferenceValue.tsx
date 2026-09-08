import { Form, Select } from 'erxes-ui';
import { FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSegment } from '../../context/SegmentProvider';
import { TNodePath, TSegmentForm } from '../../types';
import { FieldWithError } from '../FieldWithError';
import { SelectSegment } from '../SelectSegment';

export const SegmentReferenceValue = ({ path }: { path: TNodePath }) => {
  const { form, contentType, segment, stats } = useSegment();
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  return (
    <>
      <div className="w-[150px] shrink-0">
        <Form.Field
          control={form.control}
          name={`${path}.exclude` as FieldPath<TSegmentForm>}
          render={({ field }) => (
            <Select
              value={field.value ? 'exclude' : 'include'}
              onValueChange={(next) => field.onChange(next === 'exclude')}
            >
              <Select.Trigger className="w-full">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="include">{t('is-in-segment')}</Select.Item>
                <Select.Item value="exclude">
                  {t('is-not-in-segment')}
                </Select.Item>
              </Select.Content>
            </Select>
          )}
        />
      </div>

      <div className="flex-1 min-w-[120px]">
        <Form.Field
          control={form.control}
          name={`${path}.segmentId` as FieldPath<TSegmentForm>}
          render={({ field, fieldState }) => (
            <FieldWithError error={fieldState.error}>
              <SelectSegment
                contentType={contentType}
                selected={
                  typeof field.value === 'string' ? field.value : undefined
                }
                exclude={segment?._id ? [segment._id] : undefined}
                onSelect={(next) => {
                  field.onChange(next || '');
                  stats.countSettled();
                }}
              />
            </FieldWithError>
          )}
        />
      </div>
    </>
  );
};
