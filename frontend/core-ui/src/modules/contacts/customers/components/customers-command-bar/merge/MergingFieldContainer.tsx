import { Avatar, ChoiceboxGroup } from 'erxes-ui';
import { FieldType } from './MergeMap';
import { GENDER_CODE } from '@/contacts/customers/constants/genderCode';

interface MergingFieldContainerProps {
  fieldName: string;
  fieldValue: any;
  type?: FieldType;
  disabled?: boolean;
  /** Radio value; defaults to fieldValue. Pass it when fieldValue isn't a string. */
  value?: string;
}

export const MergingFieldContainer = ({
  fieldName,
  fieldValue,
  type = 'string',
  disabled = false,
  value,
}: MergingFieldContainerProps) => {
  if (type === 'links' || !fieldValue) return <span className="w-full" />;

  return (
    <ChoiceboxGroup.Item
      className="w-full p-3 gap-[6px] h-min justify-center flex-col items-start flex min-h-14 rounded-sm text-wrap"
      title={fieldName}
      value={value ?? fieldValue}
      disabled={disabled}
    >
      {type === 'string' && <StringField fieldValue={fieldValue} />}
      {type === 'link' && <StringField fieldValue={fieldValue} />}
      {type === 'Array' && <ArrayField fieldValue={fieldValue} />}
      {type === 'sex' && <SexField fieldValue={fieldValue} />}
      {type === 'owner' && <OwnerField fieldValue={fieldValue} />}
      {type === 'company' && <CompanyField fieldValue={fieldValue} />}
      {type === 'avatar' && <AvatarField fieldValue={fieldValue}></AvatarField>}
    </ChoiceboxGroup.Item>
  );
};

const StringField = ({ fieldValue }: { fieldValue: string }) => {
  return <span className="font-semibold text-sm">{fieldValue}</span>;
};
const ArrayField = ({ fieldValue }: { fieldValue: string[] }) => {
  return (
    <div className="flex flex-col gap-1">
      {fieldValue.map((value: string, index: number) => (
        <span
          key={`${fieldValue}-${index}`}
          className="font-semibold text-sm text-left"
        >
          {value}
        </span>
      ))}
    </div>
  );
};
const SexField = ({ fieldValue = 0 }: { fieldValue: 0 | 1 | 2 | 9 }) => {
  return (
    <span className="font-semibold text-sm">{GENDER_CODE[fieldValue]}</span>
  );
};

const OwnerField = ({
  fieldValue,
}: {
  fieldValue: {
    _id: string;
    username?: string;
    email?: string;
    details?: { fullName?: string };
  };
}) => {
  return (
    <span className="font-semibold text-sm">
      {fieldValue?.details?.fullName ||
        fieldValue?.username ||
        fieldValue?.email ||
        fieldValue?._id}
    </span>
  );
};

const CompanyField = ({
  fieldValue,
}: {
  fieldValue: { _id: string; primaryName?: string };
}) => {
  return (
    <span className="font-semibold text-sm">
      {fieldValue?.primaryName || fieldValue?._id}
    </span>
  );
};

const AvatarField = ({ fieldValue }: { fieldValue: string }) => {
  return (
    <Avatar>
      <Avatar.Image src={fieldValue} />
    </Avatar>
  );
};
