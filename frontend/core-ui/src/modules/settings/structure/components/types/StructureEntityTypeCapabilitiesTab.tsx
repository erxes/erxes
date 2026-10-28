import { Badge, Checkbox, Form, Label, Skeleton } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useStructureCapabilities } from '../../hooks/useStructureEntityTypesList';
import { IStructureEntityTypeForm } from '../../types/structureEntity';

export const StructureEntityTypeCapabilitiesTab = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { control } = useFormContext<IStructureEntityTypeForm>();
  const { capabilities, loading, error } = useStructureCapabilities();

  if (loading) {
    return (
      <div className="flex flex-col gap-2 py-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="py-4 text-sm text-destructive">{error.message}</p>;
  }

  return (
    <Form.Field
      control={control}
      name="capabilities"
      render={({ field }) => (
        <Form.Item className="flex flex-col gap-2 py-4">
          <p className="text-sm text-muted-foreground">
            {t('capabilities-description')}
          </p>
          {capabilities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('no-capabilities')}
            </p>
          )}
          {capabilities.map(({ key, label, description, plugin }) => {
            const id = `structure-capability-${key}`;
            const isCore = plugin === 'core';
            const checked = field.value.includes(key);

            return (
              <div
                key={key}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(next) =>
                    field.onChange(
                      next === true
                        ? [...field.value, key]
                        : field.value.filter((value) => value !== key),
                    )
                  }
                />
                <div className="flex flex-col gap-1">
                  <Label htmlFor={id} className="flex items-center gap-2">
                    {isCore ? t(`capability-${key}`, label) : label}
                    {!isCore && (
                      <Badge variant="secondary" className="capitalize">
                        {plugin}
                      </Badge>
                    )}
                  </Label>
                  {(isCore || description) && (
                    <span className="text-xs text-muted-foreground">
                      {isCore
                        ? t(`capability-${key}-description`, description ?? '')
                        : description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </Form.Item>
      )}
    />
  );
};
