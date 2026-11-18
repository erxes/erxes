import { Control } from 'react-hook-form';
import type { ScreenConfigFormData } from './ScreenConfig';
import {
  PosSwitchList,
  PosSwitchRow,
} from '@/pos/components/pos-edit/PosSwitchRow';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

interface PrintConfigProps {
  control: Control<ScreenConfigFormData>;
}

export const PrintConfig: React.FC<PrintConfigProps> = ({ control }) => {
  const labels = usePosSettingsLabels();
  return (
    <PosSwitchList>
      <PosSwitchRow
        control={control}
        name="kitchenIsPrint"
        label={labels.kitchenPrint}
        description={labels.kitchenPrintDescription}
      />
      <PosSwitchRow
        control={control}
        name="waitingIsPrint"
        label={labels.waitingPrint}
        description={labels.waitingPrintDescription}
      />
    </PosSwitchList>
  );
};
