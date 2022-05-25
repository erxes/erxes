import React from 'react';
import { __ } from '@erxes/ui/src/utils';
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
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IDonate, IDonateDoc } from '../types';
import SelectCampaigns from '../../containers/SelectCampaigns';
import { queries } from '../../../configs/donateCampaign/graphql';
import SelectCompanies from '@erxes/ui/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui/src/customers/containers/SelectCustomers';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  donate: IDonate;
  closeModal: () => void;
  queryParams: any;
};

type State = {
  donate: IDonate;
};

class DonateForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { donate = {} as IDonate, queryParams } = this.props;

    if (!donate.campaignId && queryParams.campaignId) {
      donate.campaignId = queryParams.campaignId;
    }

    if (!donate.ownerType) {
      donate.ownerType = 'customer';
    }

    this.state = {
      donate
    };
  }

  generateDoc = (values: { _id: string } & IDonateDoc) => {
    const { donate } = this.props;

    const finalValues = values;

    if (donate) {
      finalValues._id = donate._id;
    }

    return {
      _id: finalValues._id,
      ...this.state.donate
    };
  };

  onChangeInput = e => {
    const name = e.target.name;
    let value = e.target.value;
    if (e.target.type === 'number') {
      value = Number(value);
    }

    this.setState({ donate: { ...this.state.donate, [name]: value } } as any);
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
    const { donate } = this.state;
    this.setState({ donate: { ...donate, campaignId: value } });
  };

  onChangeSelect = e => {
    const { donate } = this.state;
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    this.setState({ donate: { ...donate, [name]: value } });
  };

  onChangeOwnerId = ownerId => {
    const { donate } = this.state;
    this.setState({ donate: { ...donate, ownerId } });
  };

  renderOwner = () => {
    const { donate } = this.state;
    if (donate.ownerType === 'customer') {
      return (
        <SelectCustomers
          label="Customer"
          name="ownerId"
          multi={false}
          initialValue={donate.ownerId}
          onSelect={this.onChangeOwnerId}
        />
      );
    }

    if (donate.ownerType === 'user') {
      return (
        <SelectTeamMembers
          label="Team member"
          name="ownerId"
          multi={false}
          initialValue={donate.ownerId}
          onSelect={this.onChangeOwnerId}
        />
      );
    }

    return (
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={donate.ownerId}
        onSelect={this.onChangeOwnerId}
      />
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { donate } = this.state;
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Campaign</ControlLabel>
            <SelectCampaigns
              queryName="donateCampaigns"
              customQuery={queries.donateCampaigns}
              label="Choose donate campaign"
              name="campaignId"
              onSelect={this.onChangeCampaign}
              initialValue={donate.campaignId}
              filterParams={
                donate._id ? { equalTypeCampaignId: donate.campaignId } : {}
              }
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Owner type</ControlLabel>
            <FormControl
              {...formProps}
              name="ownerType"
              componentClass="select"
              defaultValue={donate.ownerType}
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
            <ControlLabel required={true}>Donate Score</ControlLabel>
            <FormControl
              {...formProps}
              name="donateScore"
              type="number"
              min={0}
              defaultValue={donate.donateScore}
              onChange={this.onChangeInput}
            />
          </FormGroup>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'donate',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.donate
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default DonateForm;
