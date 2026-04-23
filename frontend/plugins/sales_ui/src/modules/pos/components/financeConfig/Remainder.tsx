import { Control, Controller } from 'react-hook-form';
import { Label, Switch } from 'erxes-ui';
import type { FinanceConfigFormData } from './FinanceConfig';

interface RemainderProps {
  control: Control<FinanceConfigFormData>;
}

export const Remainder: React.FC<RemainderProps> = ({ control }) => {
  return (
    <div className="flex gap-8">
      <Controller
        name="checkErkhet"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col space-y-2">
            <Label>CHECK ERKHET</Label>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      <Controller
        name="checkInventories"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col space-y-2">
            <Label>CHECK INVENTORIES</Label>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
    </div>
  );
};
