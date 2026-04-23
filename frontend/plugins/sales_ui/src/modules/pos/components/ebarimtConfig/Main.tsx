import { Control, Controller } from 'react-hook-form';
import { Label, Input } from 'erxes-ui';
import type { EbarimtConfigFormData } from './EbarimtConfig';

interface MainProps {
  control: Control<EbarimtConfigFormData>;
}

export const Main: React.FC<MainProps> = ({ control }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Controller
        name="companyName"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>COMPANY NAME</Label>
            <Input
              {...field}
              value={field.value || ''}
              placeholder="Enter company name"
            />
          </div>
        )}
      />

      <Controller
        name="ebarimtUrl"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>EBARIMT URL</Label>
            <Input
              {...field}
              value={field.value || ''}
              placeholder="Enter ebarimt URL"
            />
          </div>
        )}
      />

      <Controller
        name="checkTaxpayerUrl"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>CHECK TAXPAYER URL</Label>
            <Input
              {...field}
              value={field.value || ''}
              placeholder="Enter check taxpayer URL"
            />
          </div>
        )}
      />
    </div>
  );
};
