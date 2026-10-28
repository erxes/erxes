import { useTranslation } from 'react-i18next';
import {
  SelectMember,
  SelectStructureEntities,
  TFilesPrincipalType,
} from 'ui-modules';

type TFilesPrincipalSelectProps = {
  type: TFilesPrincipalType;
  value?: string;
  onChange: (id?: string) => void;
};

const single = (value?: string | string[] | null) =>
  (Array.isArray(value) ? value[0] : value) || undefined;

export const FilesPrincipalSelect = ({
  type,
  value,
  onChange,
}: TFilesPrincipalSelectProps) => {
  const { t } = useTranslation('files');

  switch (type) {
    case 'user':
      return (
        <SelectMember.FormItem
          mode="single"
          value={value}
          placeholder={t('choose-member')}
          onValueChange={(next) => onChange(single(next))}
        />
      );
    case 'entity':
      return (
        <SelectStructureEntities.FormItem
          mode="single"
          value={value}
          onValueChange={(next) => onChange(single(next))}
        />
      );
    default:
      return (
        <span className="flex h-8 items-center text-sm text-muted-foreground">
          {t('principal-everyone')}
        </span>
      );
  }
};
