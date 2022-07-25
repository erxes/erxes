import React from 'react';
import { FormGroup, ControlLabel, Button, FormControl } from '@erxes/ui/src';
import { Block, FlexRow } from '../../../styles';
import { ISlot } from '../../../types';

type Props = {
  onChange: (slot: ISlot) => void;
  removeItem: (_id: string) => void;
  slot: ISlot;
};

export default class PosSlotItem extends React.Component<Props> {
  onChangeInput = e => {
    const { slot } = this.props;
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    this.props.onChange({
      ...slot,
      [name]: value
    });
  };

  render() {
    const { slot, removeItem } = this.props;
    return (
      <>
        <Block>
          <FlexRow key={slot._id}>
            <FormGroup>
              <ControlLabel>Code</ControlLabel>
              <FormControl
                id="code"
                name="code"
                type="text"
                value={slot.code}
                onChange={this.onChangeInput}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                id="name"
                name="name"
                type="text"
                value={slot.name}
                onChange={this.onChangeInput}
              />
            </FormGroup>
            <Button
              btnStyle="danger"
              icon="trash"
              onClick={() => removeItem(slot._id || '')}
            />
          </FlexRow>
        </Block>
      </>
    );
  }
}
