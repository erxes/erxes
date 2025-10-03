import { useQuery } from '@apollo/client';
import { Select } from 'erxes-ui';
import { DISTRICTS } from '~/modules/payment/graphql/queries';

type Props = {
  cityCode?: string;
  value?: string;
  onChange: (value: string) => void;
};

const SelectDistrict = (props: Props) => {
  const { cityCode, value, onChange } = props;

  const { data } = useQuery<{
    qpayGetDistricts: { code: string; name: string }[];
  }>(DISTRICTS, {
    variables: { cityCode },
    skip: !cityCode,
  });

  return (
    <Select onValueChange={onChange} value={value} disabled={!cityCode}>
      <Select.Trigger>
        <Select.Value placeholder="Select district" />
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {data?.qpayGetDistricts.map(
            (district: { code: string; name: string }) => (
              <Select.Item key={district.code} value={district.code}>
                {district.name}
              </Select.Item>
            ),
          )}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};

export default SelectDistrict;
