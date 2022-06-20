import React from 'react';
import { IPos } from '../../../types';
import {
  __,
  ControlLabel,
  Label,
  FormControl,
  FormGroup,
  Toggle
} from '@erxes/ui/src';
type Props = {
  onChange: (name: 'cardsConfig', value: any) => void;
  pos?: IPos;
};
class CardsConfig extends React.Component<Props, { config: any }> {
  constructor(props: Props) {
    super(props);

    const config =
      props.pos && props.pos.cardsConfig
        ? props.pos.cardsConfig
        : {
            isSyncErkhet: false,
            userEmail: '',
            defaultPay: ''
          };

    this.state = {
      config
    };
  }
  render() {
    return (
      <ControlLabel>
        <div>Config</div>
      </ControlLabel>
    );
  }
}
export default CardsConfig;
