import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, cn, DatePicker, Form, Input, Switch } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IWorkhoursForm } from '../../types/workhours';
import { WorkTimeField } from './WorkTimeField';

const DEFAULT_HOLIDAY_START = '09:00';
const DEFAULT_HOLIDAY_END = '18:00';

const toDateValue = (date?: unknown) =>
  date instanceof Date ? date.toISOString() : '';

const StructureHolidayRow = ({
  index,
  onRemove,
}: {
  index: number;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { control, setValue } = useFormContext<IWorkhoursForm>();
  const [isInactive, startDate, endDate, startFrom, endTo] = useWatch({
    control,
    name: [
      `holidays.${index}.inactive`,
      `holidays.${index}.startDate`,
      `holidays.${index}.endDate`,
      `holidays.${index}.startFrom`,
      `holidays.${index}.endTo`,
    ],
  });
  const [hasWorkHours, setHasWorkHours] = useState(Boolean(startFrom || endTo));

  const toggleWorkHours = (checked: boolean) => {
    setHasWorkHours(checked);
    setValue(
      `holidays.${index}.startFrom`,
      checked ? startFrom || DEFAULT_HOLIDAY_START : '',
    );
    setValue(
      `holidays.${index}.endTo`,
      checked ? endTo || DEFAULT_HOLIDAY_END : '',
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-md border p-3',
        isInactive && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-3">
        <Form.Field
          control={control}
          name={`holidays.${index}.inactive`}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Switch
                  checked={!field.value}
                  onCheckedChange={(checked) => field.onChange(!checked)}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name={`holidays.${index}.name`}
          render={({ field }) => (
            <Form.Item className="flex-1">
              <Form.Control>
                <Input placeholder={t('holiday-name')} {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <div className="flex items-center gap-3 shrink-0">
          <DatePicker
            className="w-36"
            mode="single"
            placeholder={t('start-date')}
            value={startDate || undefined}
            onChange={(date) =>
              setValue(`holidays.${index}.startDate`, toDateValue(date))
            }
          />
          <span className="font-medium text-sm text-accent-foreground">
            {t('to')}
          </span>
          <DatePicker
            className="w-36"
            mode="single"
            placeholder={t('end-date')}
            value={endDate || undefined}
            onChange={(date) =>
              setValue(`holidays.${index}.endDate`, toDateValue(date))
            }
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={t('remove-holiday')}
        >
          <IconTrash />
        </Button>
      </div>
      <div className="flex items-center gap-3 pl-11">
        <Switch
          checked={hasWorkHours}
          onCheckedChange={toggleWorkHours}
          disabled={isInactive}
        />
        <span className="text-sm text-accent-foreground">
          {t('working-hours-label')}
        </span>
        {hasWorkHours && (
          <div className="flex items-center gap-3">
            <WorkTimeField name={`holidays.${index}.startFrom`} />
            <span className="font-medium text-sm text-accent-foreground">
              {t('to')}
            </span>
            <WorkTimeField name={`holidays.${index}.endTo`} />
          </div>
        )}
      </div>
    </div>
  );
};

export const StructureHolidays = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { control } = useFormContext<IWorkhoursForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'holidays',
  });

  const addHoliday = () =>
    append({
      _id: nanoid(),
      name: '',
      startDate: '',
      endDate: '',
      inactive: false,
      startFrom: '',
      endTo: '',
    });

  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-semibold">{t('custom-holidays')}</span>
          <span className="text-sm text-accent-foreground">
            {t('add-special-periods')}
          </span>
        </div>
        <Button type="button" variant="secondary" onClick={addHoliday}>
          <IconPlus />
          {t('add-holiday')}
        </Button>
      </div>
      {fields.length === 0 ? (
        <span className="text-sm text-accent-foreground py-2">
          {t('no-holidays')}
        </span>
      ) : (
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <StructureHolidayRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
