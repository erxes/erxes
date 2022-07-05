import React from 'react';
import { FormGroup, ControlLabel, Button, FormControl } from '@erxes/ui/src';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { Block, FlexRow } from '../../../styles';
import { IPos, ISlot } from '../../../types';

type Props = {
  removeMapping: (_id: string) => void;
  key: string;
  item: ISlot;
  productCategories: IProductCategory[];
  pos: IPos;
  slotGroup?: ISlot;
  closeModal: () => void;
  onEdit: (_id: string, type: string, value: string) => void;
};

type State = {
  slotGroup: ISlot;
};
export const total = 8;

export default class PosProdItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      slotGroup: {
        _id: `temporaryId${String(Math.random())}`,
        code: '',
        name: ''
      }
    };
  }

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };
  onChangeFunction = (name: any, value: any) => {
    const { slotGroup } = this.state;
    slotGroup[name] = value;
    this.setState({ slotGroup });
  };

  render() {
    const { item, removeMapping } = this.props;

    const onChangeName = e => {
      this.onChangeFunction(
        'name',
        (e.currentTarget as HTMLInputElement).value
      );
      this.props.onEdit(this.props.item._id, 'name', e.currentTarget.value);
    };
    const onChangeCode = e => {
      this.onChangeFunction(
        'code',
        (e.currentTarget as HTMLInputElement).value
      );
      this.props.onEdit(this.props.item._id, 'code', e.currentTarget.value);
    };

    return (
      <>
        <Block>
          <FlexRow key={item._id}>
            <FormGroup>
              <ControlLabel>Code</ControlLabel>
              <FormControl
                name="code"
                value={item.code}
                autoFocus={true}
                onChange={onChangeCode}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                name="name"
                value={item.name}
                autoFocus={true}
                onChange={onChangeName}
              />
            </FormGroup>
            <Button
              btnStyle="danger"
              icon="trash"
              onClick={() => removeMapping(item._id)}
            />
          </FlexRow>
        </Block>
      </>
    );
  }
}
