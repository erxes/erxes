import { Control, FieldPathByValue } from 'react-hook-form';
import { Input } from 'erxes-ui';
import {
  TOURISM_PANEL_INPUT_CLASS_NAME,
  TourismPanelFormField,
} from '@/tms/side-panel/TourismPanelForm';
import { useTranslation } from 'react-i18next';
import { AmenityCreateFormType } from '../constants/formSchema';
import { AmenityIconPicker } from './AmenityIconPicker';

type AmenityTextFieldPath = FieldPathByValue<
  AmenityCreateFormType,
  string | undefined
>;

interface AmenityNameFieldProps {
  control: Control<AmenityCreateFormType>;
  name?: AmenityTextFieldPath;
  labelSuffix?: string;
}

export const AmenityNameField = ({
  control,
  name = 'name',
  labelSuffix = '',
}: AmenityNameFieldProps) => {
  const { t } = useTranslation('tourism');
  return (
    <TourismPanelFormField
      control={control}
      name={name}
      required
      label={
        <>
          {t('name')}
          <span className="text-primary">{labelSuffix}</span>
        </>
      }
      render={(field) => (
        <Input
          placeholder={t('amenity-name-placeholder')}
          className={TOURISM_PANEL_INPUT_CLASS_NAME}
          {...field}
        />
      )}
    />
  );
};

export const AmenityIconField = ({
  control,
}: {
  control: Control<AmenityCreateFormType>;
}) => {
  const { t } = useTranslation('tourism');
  return (
    <TourismPanelFormField
      control={control}
      name="icon"
      label={t('icon')}
      render={(field) => (
        <AmenityIconPicker
          value={field.value}
          onValueChange={field.onChange}
          className="size-7 justify-center rounded-sm border bg-background p-0 shadow-none [&_svg]:size-4"
        />
      )}
    />
  );
};
