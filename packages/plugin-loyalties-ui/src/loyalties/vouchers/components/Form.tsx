import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IVoucher, IVoucherDoc } from '../types';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';

import React from 'react';
import SelectCampaigns from '../../containers/SelectCampaigns';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { __ } from '@erxes/ui/src/utils';
import { queries as campaignQueries } from '../../../configs/voucherCampaign/graphql';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  voucher: IVoucher;
  closeModal: () => void;
  queryParams: any;
};

type State = {
  voucher: IVoucher;
};

class VoucherForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { voucher = {} as IVoucher, queryParams } = this.props;

    if (!voucher.campaignId && queryParams.campaignId) {
      voucher.campaignId = queryParams.campaignId;
    }

    if (!voucher.ownerType) {
      voucher.ownerType = 'customer';
    }

    this.state = {
      voucher
    };
  }

  generateDoc = (values: { _id: string } & IVoucherDoc) => {
    const { voucher } = this.props;

    const finalValues = values;

    if (voucher) {
      finalValues._id = voucher._id;
    }

    return {
      _id: finalValues._id,
      ...this.state.voucher
    };
  };

  onChangeInput = e => {
    const name = e.target.name;
    let value = e.target.value;
    if (e.target.type === 'number') {
      value = Number(value);
    }

    this.setState({ voucher: { ...this.state.voucher, [name]: value } } as any);
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} onChange={this.onChangeInput} />
      </FormGroup>
    );
  };

  onChangeCampaign = value => {
    const { voucher } = this.state;
    this.setState({ voucher: { ...voucher, campaignId: value } });
  };

  onChangeSelect = e => {
    const { voucher } = this.state;
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    this.setState({ voucher: { ...voucher, [name]: value } });
  };

  onChangeOwnerId = ownerId => {
    const { voucher } = this.state;
    this.setState({ voucher: { ...voucher, ownerId } });
  };

  renderOwner = () => {
    const { voucher } = this.state;
    if (voucher.ownerType === 'customer') {
      return (
        <SelectCustomers
          label="Customer"
          name="ownerId"
          multi={false}
          initialValue={voucher.ownerId}
          onSelect={this.onChangeOwnerId}
        />
      );
    }

    if (voucher.ownerType === 'user') {
      return (
        <SelectTeamMembers
          label="Team member"
          name="ownerId"
          multi={false}
          initialValue={voucher.ownerId}
          onSelect={this.onChangeOwnerId}
        />
      );
    }

    return (
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={voucher.ownerId}
        onSelect={this.onChangeOwnerId}
      />
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { voucher } = this.state;
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Campaign</ControlLabel>
            <SelectCampaigns
              queryName="voucherCampaigns"
              customQuery={campaignQueries.voucherCampaigns}
              label="Choose voucher campaign"
              name="campaignId"
              onSelect={this.onChangeCampaign}
              initialValue={voucher.campaignId}
              filterParams={
                voucher._id ? { equalTypeCampaignId: voucher.campaignId } : {}
              }
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Owner type</ControlLabel>
            <FormControl
              {...formProps}
              name="ownerType"
              componentClass="select"
              defaultValue={voucher.ownerType}
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
              defaultValue={voucher.status}
              required={true}
              onChange={this.onChangeSelect}
            >
              <option key={'new'} value={'new'}>
                {' '}
                {'new'}{' '}
              </option>
              <option key={'used'} value={'used'}>
                {' '}
                {'used'}{' '}
              </option>
            </FormControl>
          </FormGroup>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'voucher',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.voucher
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default VoucherForm;
