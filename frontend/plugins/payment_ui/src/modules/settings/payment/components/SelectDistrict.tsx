import { useQuery } from '@apollo/client';
import { Select } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DISTRICTS } from '~/modules/payment/graphql/queries';

type Props = {
  cityCode?: string;
  value?: string;
  onChange: (value: string) => void;
};

const SelectDistrict = ({ cityCode, value, onChange }: Props) => {
  const { t } = useTranslation('payment');

  const { data } = useQuery(DISTRICTS, {
    variables: { cityCode: cityCode || '' },
    skip: !cityCode,
  });

  const options = useMemo(
    () =>
      (data?.qpayGetDistricts ?? []).map((district) => ({
        value: district.code,
        label: district.name,
      })),
    [data],
  );

  const isDisabled = !cityCode;

  return (
    <Select onValueChange={onChange} value={value} disabled={isDisabled}>
      <Select.Trigger>
        <Select.Value placeholder={t('select-district')} />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};

export default SelectDistrict;
