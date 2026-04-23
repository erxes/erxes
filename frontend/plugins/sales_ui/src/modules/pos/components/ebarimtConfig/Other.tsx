import { Control, Controller } from 'react-hook-form';
import { Label, Input } from 'erxes-ui';
import type { EbarimtConfigFormData } from './EbarimtConfig';

interface OtherProps {
  control: Control<EbarimtConfigFormData>;
}

export const Other: React.FC<OtherProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Controller
          name="companyRD"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>COMPANYRD</Label>
              <Input
                {...field}
                value={field.value || ''}
                placeholder="Enter company RD"
              />
            </div>
          )}
        />

        <Controller
          name="merchantTin"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>MERCHANTTIN</Label>
              <Input
                {...field}
                value={field.value || ''}
                placeholder="Enter merchant TIN"
              />
            </div>
          )}
        />

        <Controller
          name="posNo"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>POSNO</Label>
              <Input
                {...field}
                value={field.value || ''}
                placeholder="Enter POS number"
              />
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Controller
          name="districtCode"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>DISTRICTCODE</Label>
              <Input
                {...field}
                value={field.value || ''}
                placeholder="Enter district code"
              />
            </div>
          )}
        />

        <Controller
          name="branchNo"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>BRANCHNO</Label>
              <Input
                {...field}
                value={field.value || ''}
                placeholder="Enter branch number"
              />
            </div>
          )}
        />

        <Controller
          name="defaultGSCode"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>DEFAULTGSCODE</Label>
              <Input
                {...field}
                value={field.value || ''}
                placeholder="Enter default GS code"
              />
            </div>
          )}
        />
      </div>
    </div>
  );
};
