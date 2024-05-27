import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import { RiskConfig } from '../../../gql/types';
import { FlexRow } from '../../../styles';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Label from '@erxes/ui/src/components/Label';

type Props = {
  riskName: string;
  config: RiskConfig;
  index: number;
  onChange: (index: number, riskConfig: RiskConfig) => void;
};

const Row = (props: Props) => {
  const { config } = props;

  const onChangeInput = (key, value) => {
    props.onChange(props.index, {
      ...config,
      [key]: value
    });
  };

  return (
    <>
      <p>{props.riskName}</p>
      <FlexRow>
        <FormGroup>
          <ControlLabel>Coverage </ControlLabel>
          <FormControl
            componentClass="input"
            placeholder="Coverage"
            type="number"
            max={100}
            min={0}
            value={config.coverage}
            useNumberFormat={true}
            onChange={(e: any) => onChangeInput('coverage', e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Coverage limit</ControlLabel>
          <FormControl
            componentClass="input"
            placeholder="Coverage limit"
            type="number"
            max={100}
            min={0}
            value={config.coverageLimit}
            onChange={(e: any) =>
              onChangeInput('coverageLimit', e.target.value)
            }
          />
        </FormGroup>
      </FlexRow>
    </>
  );
};

export default Row;
