import {
  __,
  FormGroup,
  ControlLabel,
  CollapseContent,
  FormControl,
  SelectTeamMembers,
  Toggle
} from 'erxes-ui';
import { LeftItem } from 'erxes-ui/lib/components/step/styles';
import React from 'react';
import { FlexColumn, FlexItem } from '../../../styles';
import { IBrand } from 'erxes-ui/lib/products/types';
import SelectBrand from '../../containers/SelectBrand';
import { IPos } from '../../../types';

type Props = {
  onChange: (name: 'pos' | 'brand', value: any) => void;
  pos?: IPos;
  brand?: IBrand;
};

class GeneralStep extends React.Component<Props, {}> {
  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  render() {
    const { pos, brand } = this.props;

    const onChangeBrand = e => {
      this.onChangeFunction(
        'brand',
        (e.currentTarget as HTMLInputElement).value
      );
    };

    const onChangeName = e => {
      pos.name = (e.currentTarget as HTMLInputElement).value;
      this.onChangeFunction('pos', pos);
    };

    const onChangeDescription = e => {
      pos.description = (e.currentTarget as HTMLInputElement).value;
      this.onChangeFunction('pos', pos);
    };

    const onAdminSelect = users => {
      pos.adminIds = users;
      this.onChangeFunction('pos', pos);
    };

    const onCashierSelect = users => {
      pos.cashierIds = users;
      this.onChangeFunction('pos', pos);
    };

    let name = 'POS name';
    let description = 'description';
    let cashierIds = [];
    let adminIds = [];

    if (pos) {
      name = pos.name;
      description = pos.description;
      cashierIds = pos.cashierIds;
      adminIds = pos.adminIds;
    }

    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <CollapseContent title="POS" open={true}>
              <FormGroup>
                <ControlLabel>Name</ControlLabel>
                <FormControl
                  id="name"
                  type="text"
                  value={name}
                  onChange={onChangeName}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  id="description"
                  componentClass="textarea"
                  value={description}
                  onChange={onChangeDescription}
                />
              </FormGroup>

              <FormGroup>
                <SelectBrand
                  isRequired={true}
                  onChange={onChangeBrand}
                  defaultValue={brand ? brand._id : ' '}
                />
              </FormGroup>
            </CollapseContent>

            <CollapseContent title="Domain">
              <FormGroup>
                <ControlLabel>Waiting screen</ControlLabel>
                <Toggle
                  checked={false}
                  // onChange={onSwitchHandler}
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>
                  }}
                />
              </FormGroup>
            </CollapseContent>

            <CollapseContent title="Features">
              <></>
            </CollapseContent>

            <CollapseContent title="Permission">
              <FormGroup>
                <ControlLabel>POS admin</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose team member')}
                  name="adminIds"
                  initialValue={adminIds}
                  onSelect={onAdminSelect}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>POS cashier</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose team member')}
                  name="cashierIds"
                  initialValue={cashierIds}
                  onSelect={onCashierSelect}
                />
              </FormGroup>
            </CollapseContent>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default GeneralStep;
