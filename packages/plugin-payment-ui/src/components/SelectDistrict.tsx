import { FlexRow, LeftContent } from '@erxes/ui-settings/src/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { District } from '../types';

type Props = {
  districts: District[];
  isRequired?: boolean;
  defaultValue?: string;
  onChange: (value: string) => void;
};

const SelectPayments: React.FC<Props> = (props) => {
  const { defaultValue, onChange, isRequired, districts } = props;

  return (
    <FormGroup>
      <ControlLabel required={isRequired}>District</ControlLabel>
      <FlexRow>
        <LeftContent>
          <FormControl
            componentclass='select'
            required={true}
            defaultValue={defaultValue}
            onChange={(e: any) => onChange(e.target.value)}
          >
            <option value=''>{__('Select a district')}</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </FormControl>
        </LeftContent>
      </FlexRow>
    </FormGroup>
  );
};

export default SelectPayments;
