import { useTranslation } from 'react-i18next';
import {
  SelectBranches,
  SelectDepartments,
  SelectMember,
  SelectUnit,
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
    case 'department':
      return (
        <SelectDepartments.FormItem
          mode="single"
          value={value}
          onValueChange={(next) => onChange(single(next))}
        />
      );
    case 'branch':
      return (
        <SelectBranches.FormItem
          mode="single"
          value={value}
          onValueChange={(next) => onChange(single(next))}
        />
      );
    case 'unit':
      return <SelectUnit.FormItem value={value} onValueChange={onChange} />;
    default:
      return (
        <span className="flex h-8 items-center text-sm text-muted-foreground">
          {t('principal-everyone')}
        </span>
      );
  }
};
