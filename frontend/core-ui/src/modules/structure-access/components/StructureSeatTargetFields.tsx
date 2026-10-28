import { Form, Label, RadioGroup, Skeleton } from 'erxes-ui';
import { useId } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectStructureEntities } from 'ui-modules';
import { useStructureSeats } from '../hooks/useStructureSeats';
import {
  NEW_STRUCTURE_SEAT,
  TStructureSeatTargetForm,
} from '../schemas/structureSeatTarget';
import { IStructureAccessSeat } from '../types';
import { getStructureSeatCoverageLabel } from '../utils/structureSeatCoverage';
import { StructurePositionSelect } from './StructurePositionSelect';
import { StructureSeatCoverageFields } from './StructureSeatCoverageFields';

const single = (value?: string[] | string) =>
  (Array.isArray(value) ? value[0] : value) || '';

const StructureSeatTargetSeats = ({
  entityId,
  disabled,
}: {
  entityId: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const idPrefix = useId();
  const { control } = useFormContext<TStructureSeatTargetForm>();
  const { seats, loading, error } = useStructureSeats({ entityId });

  const describe = (seat: IStructureAccessSeat) =>
    [
      getStructureSeatCoverageLabel(seat, t),
      t('holder-count', { count: seat.holderCount ?? 0 }),
    ].join(' · ');

  if (loading) {
    return <Skeleton className="h-16 w-full" />;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  return (
    <Form.Field
      control={control}
      name="seatId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('seat')}</Form.Label>
          <Form.Control>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
              className="flex flex-col gap-2"
            >
              {seats.map((seat) => (
                <div key={seat._id} className="flex items-start gap-2">
                  <RadioGroup.Item
                    id={`${idPrefix}-${seat._id}`}
                    value={seat._id}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`${idPrefix}-${seat._id}`}
                    className="flex flex-col gap-0.5 font-normal"
                  >
                    <span>{seat.position?.name ?? seat.positionId}</span>
                    <span className="text-xs text-muted-foreground">
                      {describe(seat)}
                    </span>
                  </Label>
                </div>
              ))}
              <div className="flex items-start gap-2">
                <RadioGroup.Item
                  id={`${idPrefix}-new`}
                  value={NEW_STRUCTURE_SEAT}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={`${idPrefix}-new`}
                  className="flex flex-col gap-0.5 font-normal"
                >
                  <span>{t('new-seat')}</span>
                  <span className="text-xs text-muted-foreground">
                    {seats.length
                      ? t('new-seat-description')
                      : t('no-seats-at-node')}
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const StructureSeatTargetFields = ({
  disabled,
}: {
  disabled?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { control, setValue } = useFormContext<TStructureSeatTargetForm>();
  const [entityId, seatId] = useWatch({
    control,
    name: ['entityId', 'seatId'],
  });

  return (
    <>
      <Form.Field
        control={control}
        name="entityId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('node')}</Form.Label>
            <SelectStructureEntities.FormItem
              mode="single"
              value={field.value}
              placeholder={t('select-node')}
              onValueChange={(value) => {
                field.onChange(single(value));
                setValue('seatId', '');
                setValue('positionId', '');
                setValue('coverage', 'node');
                setValue('coveredEntityIds', []);
              }}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      {entityId && (
        <StructureSeatTargetSeats entityId={entityId} disabled={disabled} />
      )}
      {entityId && seatId === NEW_STRUCTURE_SEAT && (
        <>
          <Form.Field
            control={control}
            name="positionId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('position')}</Form.Label>
                <StructurePositionSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
          <StructureSeatCoverageFields
            entityId={entityId}
            disabled={disabled}
          />
        </>
      )}
    </>
  );
};
