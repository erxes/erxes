import React from 'react';
import SelectCampaigns from '../../containers/SelectCampaigns';
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ISpin, ISpinDoc } from '../types';
import { queries } from '../../../configs/spinCampaign/graphql';
import { queries as voucherCampaignQueries } from '../../../configs/voucherCampaign/graphql';
import SelectCompanies from '@erxes/ui/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui/src/customers/containers/SelectCustomers';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  spin: ISpin;
  closeModal: () => void;
  queryParams: any;
};

type State = {
  spin: ISpin;
};

class SpinForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { spin = {} as ISpin, queryParams } = this.props;

    if (!spin.campaignId && queryParams.campaignId) {
      spin.campaignId = queryParams.campaignId;
    }

    if (!spin.ownerType) {
      spin.ownerType = 'customer';
    }

    this.state = {
      spin
    };
  }

  generateDoc = (values: { _id: string } & ISpinDoc) => {
    const { spin } = this.props;

    const finalValues = values;

    if (spin) {
      finalValues._id = spin._id;
    }

    return {
      _id: finalValues._id,
      ...this.state.spin
    };
  };

  onChangeInput = e => {
    const name = e.target.name;
    let value = e.target.value;
    if (e.target.type === 'number') {
      value = Number(value);
    }

    this.setState({ spin: { ...this.state.spin, [name]: value } } as any);
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} onChange={this.onChangeInput} />
      </FormGroup>
    );
  };

  onChangeSelect = e => {
    const { spin } = this.state;
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    this.setState({ spin: { ...spin, [name]: value } });
  };

  onChangeOwnerId = ownerId => {
    const { spin } = this.state;
    this.setState({ spin: { ...spin, ownerId } });
  };

  renderOwner = () => {
    const { spin } = this.state;
    if (spin.ownerType === 'customer') {
      return (
        <SelectCustomers
          label="Customer"
          name="ownerId"
          multi={false}
          initialValue={spin.ownerId}
          onSelect={this.onChangeOwnerId}
        />
      );
    }

    if (spin.ownerType === 'user') {
      return (
        <SelectTeamMembers
          label="Team member"
          name="ownerId"
          multi={false}
          initialValue={spin.ownerId}
          onSelect={this.onChangeOwnerId}
        />
      );
    }

    return (
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={spin.ownerId}
        onSelect={this.onChangeOwnerId}
      />
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { spin } = this.state;
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Campaign</ControlLabel>
            <SelectCampaigns
              queryName="spinCampaigns"
              customQuery={queries.spinCampaigns}
              label="Choose spin campaign"
              name="campaignId"
              onSelect={this.onChangeSelect}
              initialValue={spin.campaignId}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Owner type</ControlLabel>
            <FormControl
              {...formProps}
              name="ownerType"
              componentClass="select"
              defaultValue={spin.ownerType}
              required={true}
              onChange={this.onChangeSelect}
            >
              <option key={'customer'} value={'customer'}>
                {' '}
                {'customer'}{' '}
              </option>
              <option key={'user'} value={'user'}>
                {' '}
                {'user'}{' '}
              </option>
              <option key={'company'} value={'company'}>
                {' '}
                {'company'}{' '}
              </option>
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>Owner</ControlLabel>
            {this.renderOwner()}
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>Status</ControlLabel>
            <FormControl
              {...formProps}
              name="status"
              componentClass="select"
              defaultValue={spin.status}
              required={true}
              onChange={this.onChangeSelect}
            >
              <option key={'new'} value={'new'}>
                {' '}
                {'new'}{' '}
              </option>
              <option key={'loss'} value={'loss'}>
                {' '}
                {'loss'}{' '}
              </option>
              <option key={'won'} value={'won'}>
                {' '}
                {'won'}{' '}
              </option>
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Voucher Campaign</ControlLabel>
            <SelectCampaigns
              queryName="voucherCampaigns"
              customQuery={voucherCampaignQueries.voucherCampaigns}
              label="Choose voucher campaign"
              name="voucherCampaignId"
              onSelect={() => {
                return;
              }}
              initialValue={spin.voucherCampaignId}
              filterParams={{ voucherType: 'spin' }}
            />
          </FormGroup>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'spin',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.spin
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default SpinForm;
