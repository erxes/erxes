import { Control, Controller } from 'react-hook-form';
import { Label, Checkbox, Textarea } from 'erxes-ui';
import type { EbarimtConfigFormData } from './EbarimtConfig';

interface UiConfigProps {
  control: Control<EbarimtConfigFormData>;
}

export const UiConfig: React.FC<UiConfigProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-8 items-end">
        <Controller
          name="headerText"
          control={control}
          render={({ field }) => (
            <div className="flex-1 space-y-2">
              <Label>HEADER TEXT</Label>
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder="Write header text"
              />
            </div>
          )}
        />

        <Controller
          name="footerText"
          control={control}
          render={({ field }) => (
            <div className="flex-1 space-y-2">
              <Label>FOOTER TEXT</Label>
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder="Write footer text"
              />
            </div>
          )}
        />
      </div>

      <div className="flex gap-8">
        <Controller
          name="hasSumQty"
          control={control}
          render={({ field }) => (
            <div className="flex gap-2 items-center">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label>HAS SUMMARY QTY</Label>
            </div>
          )}
        />

        <Controller
          name="hasCopy"
          control={control}
          render={({ field }) => (
            <div className="flex gap-2 items-center">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label>HAS COPY</Label>
            </div>
          )}
        />

        <Controller
          name="isCleanTaxPrice"
          control={control}
          render={({ field }) => (
            <div className="flex gap-2 items-center">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label>IS CLEAN TAX PRICE</Label>
            </div>
          )}
        />
      </div>
    </div>
  );
};
