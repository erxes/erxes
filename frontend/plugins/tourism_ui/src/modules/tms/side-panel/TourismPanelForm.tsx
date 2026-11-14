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
import {
  IconAlignLeft,
  IconAsterisk,
  IconCategory,
  IconCategory2,
  IconCircleDot,
  IconClock,
  IconFolder,
  IconHash,
  IconIcons,
  IconLabel,
  IconLanguage,
  IconList,
  IconPalette,
  IconPaperclip,
  IconRoute,
  IconToggleRight,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { Form } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import { TourFieldLanguageSwitch } from '@/tms/branch-detail/dashboard/_components/TourFieldLanguageSwitch';

export const TOURISM_PANEL_INPUT_CLASS_NAME = `${PANEL_INPUT_CLASS_NAME} border border-input`;

export const TOURISM_PANEL_FIELDS_CLASS_NAME = [
  '[&_.border-input]:border-transparent',
  '[&_input]:shadow-none',
  '[&_textarea]:shadow-none',
  '[&_[role=combobox]]:shadow-none',
  '[&_.erxes-blocknote]:shadow-none',
  '[&_input:not(:disabled):hover]:bg-accent',
  '[&_textarea:not(:disabled):hover]:bg-accent',
  '[&_[role=combobox]:not(:disabled):hover]:bg-accent',
].join(' ');

const FIELD_ICONS: Record<string, Icon> = {
  name: IconLabel,
  label: IconLabel,
  pluralLabel: IconLabel,
  code: IconHash,
  refNumber: IconHash,
  status: IconCircleDot,
  type: IconCategory2,
  customTourTypeId: IconCategory2,
  customTourTypeIds: IconCategory2,
  itineraryId: IconRoute,
  categoryIds: IconCategory,
  categories: IconCategory,
  parentId: IconFolder,
  duration: IconClock,
  startTime: IconClock,
  groupSize: IconUsers,
  color: IconPalette,
  icon: IconIcons,
  options: IconList,
  isRequired: IconAsterisk,
  isActive: IconToggleRight,
  attachment: IconPaperclip,
  content: IconAlignLeft,
  description: IconAlignLeft,
};

const getFieldIcon = (name: string) => FIELD_ICONS[name.split('.').pop() || ''];

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
    <PanelFormRow label={t('language')} icon={IconLanguage}>
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
  icon: LabelIcon = IconAlignLeft,
  required,
  error,
  children,
}: {
  label: ReactNode;
  icon?: Icon;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 pt-2">
    <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
      <LabelIcon className="size-3.5 shrink-0" aria-hidden="true" />
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
  icon,
  rules,
  render,
}: {
  control: Control<TValues>;
  name: TName;
  label: ReactNode;
  required?: boolean;
  block?: boolean;
  icon?: Icon;
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
          icon={icon ?? getFieldIcon(name)}
          required={required}
          error={fieldState.error?.message}
        >
          {render(field, fieldState)}
        </TourismPanelFormBlock>
      ) : (
        <PanelFormRow
          label={label}
          icon={icon ?? getFieldIcon(name)}
          required={required}
          error={fieldState.error?.message}
        >
          {render(field, fieldState)}
        </PanelFormRow>
      )
    }
  />
);
