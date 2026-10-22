import { useQuery } from '@apollo/client';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DISTRICTS } from '~/modules/payment/graphql/queries';

type Props = {
  cityCode?: string;
  value?: string;
  onChange: (value: string) => void;
};

const SelectDistrict = (props: Props) => {
  const { t } = useTranslation('payment');
  const { cityCode, value, onChange } = props;

  const { data } = useQuery(DISTRICTS, {
    variables: { cityCode: cityCode || '' },
    skip: !cityCode,
  });

  return (
    <Select onValueChange={onChange} value={value} disabled={!cityCode}>
      <Select.Trigger>
        <Select.Value placeholder={t('select-district')} />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {data?.qpayGetDistricts?.districts.map((district) => (
            <Select.Item key={district} value={district}>
              {district}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};

export default SelectDistrict;
