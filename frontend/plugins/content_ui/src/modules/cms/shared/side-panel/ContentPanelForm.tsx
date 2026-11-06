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
  IconCategory,
  IconCircleDot,
  IconFolder,
  IconHash,
  IconLabel,
  IconLanguage,
  IconLink,
  IconList,
  IconPalette,
  IconPhoto,
  IconTag,
  IconToggleRight,
  IconUsers,
  IconWorld,
  type Icon,
} from '@tabler/icons-react';
import { Form, Select } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';

export const CONTENT_PANEL_INPUT_CLASS_NAME = `${PANEL_INPUT_CLASS_NAME} border border-input`;

const FIELD_ICONS: Record<string, Icon> = {
  name: IconLabel,
  label: IconLabel,
  title: IconLabel,
  pluralLabel: IconLabel,
  code: IconHash,
  slug: IconLink,
  url: IconLink,
  link: IconLink,
  domain: IconWorld,
  status: IconCircleDot,
  type: IconCategory,
  kind: IconCategory,
  parentId: IconFolder,
  categoryIds: IconCategory,
  tagIds: IconTag,
  color: IconPalette,
  icon: IconPhoto,
  image: IconPhoto,
  thumbnail: IconPhoto,
  options: IconList,
  isActive: IconToggleRight,
  isRequired: IconToggleRight,
  assignedMemberIds: IconUsers,
  content: IconAlignLeft,
  description: IconAlignLeft,
};

export const getContentFieldIcon = (name: string) =>
  FIELD_ICONS[name.split('.').pop() || ''];

export const ContentPanelFormBlock = ({
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

export const ContentPanelFormField = <
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
        <ContentPanelFormBlock
          label={label}
          icon={icon ?? getContentFieldIcon(name)}
          required={required}
          error={fieldState.error?.message}
        >
          {render(field, fieldState)}
        </ContentPanelFormBlock>
      ) : (
        <PanelFormRow
          label={label}
          icon={icon ?? getContentFieldIcon(name)}
          required={required}
          error={fieldState.error?.message}
        >
          {render(field, fieldState)}
        </PanelFormRow>
      )
    }
  />
);

export interface IContentLanguageOption {
  value: string;
  label: string;
  isDefault: boolean;
  hasTranslation: boolean;
}

export const ContentPanelLanguageRow = ({
  selectedLanguage,
  languageOptions,
  onLanguageChange,
}: {
  selectedLanguage: string;
  languageOptions: IContentLanguageOption[];
  onLanguageChange: (language: string) => void;
}) => {
  const { t } = useTranslation('content');

  if (languageOptions.length < 2) {
    return null;
  }

  return (
    <PanelFormRow label={t('language')} icon={IconLanguage}>
      <Select
        value={selectedLanguage}
        onValueChange={(language) => {
          if (language) onLanguageChange(language);
        }}
      >
        <Select.Trigger className={CONTENT_PANEL_INPUT_CLASS_NAME}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {languageOptions.map((option) => (
            <Select.Item
              key={option.value}
              value={option.value}
              className="h-7 text-xs"
            >
              {option.label}
              {option.isDefault && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({t('default', 'Default')})
                </span>
              )}
              {option.hasTranslation && (
                <span className="ml-2 text-green-600">&#10003;</span>
              )}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </PanelFormRow>
  );
};
