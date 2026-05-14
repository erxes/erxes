import { Control, Controller } from 'react-hook-form';
import { Label, Input } from 'erxes-ui';
import type { AppearanceFormData } from './Appearance';

interface InfosProps {
  control: Control<AppearanceFormData>;
}

export const Infos: React.FC<InfosProps> = ({ control }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>WEBSITE</Label>
          <Controller
            name="website"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value || ''}
                placeholder="Enter website URL"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>PHONE</Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value || ''}
                placeholder="Enter phone number"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};
