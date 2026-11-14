import { Control, FieldPathByValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Editor, Input } from 'erxes-ui';
import {
  TOURISM_PANEL_INPUT_CLASS_NAME,
  TourismPanelFormField,
} from '@/tms/side-panel/TourismPanelForm';
import { ElementCreateFormType } from '../constants/formSchema';
import { ElementCategoriesPicker } from './SelectElementCategories';

type ElementTextFieldPath = FieldPathByValue<
  ElementCreateFormType,
  string | undefined
>;

type ElementNumberFieldPath = FieldPathByValue<
  ElementCreateFormType,
  number | undefined
>;

const LabelWithSuffix = ({
  label,
  suffix,
}: {
  label: string;
  suffix?: string;
}) => (
  <>
    {label}
    {suffix && <span className="text-primary">{suffix}</span>}
  </>
);

export const ElementPanelNameField = ({
  control,
  name,
  labelSuffix,
}: {
  control: Control<ElementCreateFormType>;
  name: ElementTextFieldPath;
  labelSuffix?: string;
}) => {
  const { t } = useTranslation('tourism');

  return (
    <TourismPanelFormField
      control={control}
      name={name}
      required
      label={<LabelWithSuffix label={t('name')} suffix={labelSuffix} />}
      render={(field) => (
        <Input
          placeholder={t('element-name')}
          className={TOURISM_PANEL_INPUT_CLASS_NAME}
          {...field}
        />
      )}
    />
  );
};

export const ElementPanelStartTimeField = ({
  control,
}: {
  control: Control<ElementCreateFormType>;
}) => {
  const { t } = useTranslation('tourism');

  return (
    <TourismPanelFormField
      control={control}
      name="startTime"
      label={t('start-time')}
      render={(field) => (
        <Input
          type="time"
          className={TOURISM_PANEL_INPUT_CLASS_NAME}
          {...field}
        />
      )}
    />
  );
};

export const ElementPanelDurationField = ({
  control,
}: {
  control: Control<ElementCreateFormType>;
}) => {
  const { t } = useTranslation('tourism');

  return (
    <TourismPanelFormField
      control={control}
      name="duration"
      label={t('duration-minutes')}
      render={(field) => (
        <Input
          type="number"
          placeholder="0"
          className={TOURISM_PANEL_INPUT_CLASS_NAME}
          {...field}
        />
      )}
    />
  );
};

export const ElementPanelCostField = ({
  control,
  name,
  currencySymbol,
}: {
  control: Control<ElementCreateFormType>;
  name: ElementNumberFieldPath;
  currencySymbol: string;
}) => {
  const { t } = useTranslation('tourism');

  return (
    <TourismPanelFormField
      control={control}
      name={name}
      label={t('cost')}
      render={(field) => (
        <div className="relative">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {currencySymbol}
          </span>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            className={`${TOURISM_PANEL_INPUT_CLASS_NAME} pl-6`}
            {...field}
          />
        </div>
      )}
    />
  );
};

export const ElementPanelCategoriesField = ({
  control,
}: {
  control: Control<ElementCreateFormType>;
}) => {
  const { t } = useTranslation('tourism');

  return (
    <TourismPanelFormField
      control={control}
      name="categories"
      label={t('categories')}
      render={(field) => (
        <ElementCategoriesPicker
          value={field.value}
          onChange={field.onChange}
          triggerClassName={TOURISM_PANEL_INPUT_CLASS_NAME}
        />
      )}
    />
  );
};

export const ElementPanelNoteField = ({
  control,
  name,
  labelSuffix,
}: {
  control: Control<ElementCreateFormType>;
  name: ElementTextFieldPath;
  labelSuffix?: string;
}) => {
  const { t } = useTranslation('tourism');

  return (
    <TourismPanelFormField
      control={control}
      name={name}
      block
      label={<LabelWithSuffix label={t('note')} suffix={labelSuffix} />}
      render={(field) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            {t('not-visible-for-clients')}
          </span>
          <div className="min-h-24 rounded-sm border text-xs">
            <Editor
              key={name}
              initialContent={field.value}
              onChange={field.onChange}
              isHTML
            />
          </div>
        </div>
      )}
    />
  );
};
