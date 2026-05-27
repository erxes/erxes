import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { DatePicker } from 'erxes-ui';

type Mode = 'single' | 'multiple';

const toDate = (val: unknown): Date | undefined => {
  if (!val) return undefined;
  if (val instanceof Date) return val;

  const d = new Date(val as any);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const toDates = (val: unknown): Date[] | undefined => {
  if (!Array.isArray(val)) return undefined;

  return val.map((v) => toDate(v)).filter((d): d is Date => !!d);
};

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  mode?: Mode;
  disabled?: boolean;
  fromDate?: Date;
};

const isDateDisabled = (date: Date, fromDate?: Date) => {
  if (!fromDate) return false;
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const min = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
  );
  return d < min;
};

export const RHFDatePicker = <T extends FieldValues>({
  control,
  name,
  mode = 'single',
  disabled = false,
  fromDate,
}: Props<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        if (mode === 'single') {
          return (
            <DatePicker
              mode="single"
              value={toDate(field.value)}
              disabled={(date: Date) =>
                !!disabled || isDateDisabled(date, fromDate)
              }
              onChange={(val) => field.onChange(val ?? undefined)}
            />
          );
        }

        return (
          <DatePicker
            mode="multiple"
            value={toDates(field.value)}
            disabled={(date: Date) =>
              !!disabled || isDateDisabled(date, fromDate)
            }
            onChange={(val) => field.onChange(val ?? undefined)}
          />
        );
      }}
    />
  );
};
