import { IconPalette } from '@tabler/icons-react';
import { PosPanelRow } from '@/pos/components/pos-edit/PosFieldRow';
import { Control, Controller } from 'react-hook-form';
import { ColorPicker } from 'erxes-ui';
import type { AppearanceFormData } from './Appearance';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

interface MainColorsProps {
  control: Control<AppearanceFormData>;
}

export const MainColors: React.FC<MainColorsProps> = ({ control }) => {
  const labels = usePosSettingsLabels();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <PosPanelRow label={labels.primary} icon={IconPalette}>
          <Controller
            name="bodyColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                className="h-7 w-24"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </PosPanelRow>

        <PosPanelRow label={labels.secondary} icon={IconPalette}>
          <Controller
            name="headerColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                className="h-7 w-24"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </PosPanelRow>

        <PosPanelRow label={labels.third} icon={IconPalette}>
          <Controller
            name="footerColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                className="h-7 w-24"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </PosPanelRow>
      </div>
    </div>
  );
};
