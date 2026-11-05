import { ReactNode } from 'react';
import {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form } from 'erxes-ui';
import { PanelFormRow } from 'ui-modules';
import { TourFieldLanguageSwitch } from '@/tms/branch-detail/dashboard/_components/TourFieldLanguageSwitch';

export const TourismPanelLanguageRow = ({
  languages,
  value,
  onValueChange,
}: {
  languages: string[];
  value: string;
  onValueChange: (language: string) => void;
}) => {
  const { t } = useTranslation('tourism');

  if (languages.length < 2) {
    return null;
  }

  return (
    <PanelFormRow label={t('language')}>
      <TourFieldLanguageSwitch
        availableLanguages={languages}
        value={value}
        onValueChange={onValueChange}
      />
    </PanelFormRow>
  );
};

export const TourismPanelFormBlock = ({
  label,
  required,
  error,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 pt-2">
    <span className="text-xs font-medium text-accent-foreground">
      {label}
      {required && <span className="text-destructive"> *</span>}
    </span>
    {children}
    {error && <span className="text-xs text-destructive">{error}</span>}
  </div>
);

export const TourismPanelFormField = <
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({
  control,
  name,
  label,
  required,
  block,
  rules,
  render,
}: {
  control: Control<TValues>;
  name: TName;
  label: ReactNode;
  required?: boolean;
  block?: boolean;
  rules?: Omit<
    RegisterOptions<TValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  render: (
    field: ControllerRenderProps<TValues, TName>,
    fieldState: ControllerFieldState,
  ) => ReactNode;
}) => (
  <Form.Field
    control={control}
    name={name}
    rules={rules}
    render={({ field, fieldState }) =>
      block ? (
        <TourismPanelFormBlock
          label={label}
          required={required}
          error={fieldState.error?.message}
        >
          {render(field, fieldState)}
        </TourismPanelFormBlock>
      ) : (
        <PanelFormRow
          label={label}
          required={required}
          error={fieldState.error?.message}
        >
          {render(field, fieldState)}
        </PanelFormRow>
      )
    }
  />
);
