import { IconMapPin } from '@tabler/icons-react';
import { Button, Collapsible, Form, Input } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TBranchForm } from '../../../types/branch';
import { TLatLng } from '../../../types/branchLocation';

type TBranchCoordinateSummaryProps = {
  position: TLatLng | null;
  onClear: () => void;
};

const COORDINATE_FIELDS = [
  { name: 'coordinate.latitude', label: 'latitude' },
  { name: 'coordinate.longitude', label: 'longitude' },
] as const;

// Invalid typed coordinates block submit, so their inputs must be visible
const useManualCoordinatesOpen = () => {
  const { formState } = useFormContext<TBranchForm>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (formState.errors.coordinate) {
      setOpen(true);
    }
  }, [formState.errors.coordinate, formState.submitCount]);

  return [open, setOpen] as const;
};

export const BranchCoordinateSummary = ({
  position,
  onClear,
}: TBranchCoordinateSummaryProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { control } = useFormContext<TBranchForm>();
  const [manualOpen, setManualOpen] = useManualCoordinatesOpen();
  const coordinateText = position
    ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
    : null;

  return (
    <Collapsible open={manualOpen} onOpenChange={setManualOpen}>
      <div className="flex items-center gap-2 border-t pt-2 text-xs text-muted-foreground">
        <IconMapPin className="size-4 shrink-0" />
        {coordinateText ? (
          <span className="font-mono text-foreground">{coordinateText}</span>
        ) : (
          <span>{t('no-location')}</span>
        )}
        <Collapsible.Trigger asChild>
          <Button variant="ghost" size="sm" className="ml-auto">
            {t('edit-manually')}
          </Button>
        </Collapsible.Trigger>
        {position && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onClear}
          >
            {t('clear-location')}
          </Button>
        )}
      </div>
      <Collapsible.Content className="grid grid-cols-2 gap-2 pt-2">
        {COORDINATE_FIELDS.map(({ name, label }) => (
          <Form.Field
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t(label)}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder={t(label)}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        ))}
      </Collapsible.Content>
    </Collapsible>
  );
};
