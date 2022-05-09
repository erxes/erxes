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
import { ILottery, ILotteryDoc } from '../types';
import SelectCampaigns from '../../containers/SelectCampaigns';
import { queries } from '../../../configs/lotteryCampaign/graphql';
import { queries as voucherCampaignQueries } from '../../../configs/voucherCampaign/graphql';
import SelectCompanies from '@erxes/ui/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui/src/customers/containers/SelectCustomers';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  lottery: ILottery;
  closeModal: () => void;
  queryParams: any;
};

type State = {
  lottery: ILottery;
};

class LotteryForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { lottery = {} as ILottery, queryParams } = this.props;

    if (!lottery.campaignId && queryParams.campaignId) {
      lottery.campaignId = queryParams.campaignId;
    }

    if (!lottery.ownerType) {
      lottery.ownerType = 'customer';
    }

    this.state = {
      lottery
    };
  }

  generateDoc = (values: { _id: string } & ILotteryDoc) => {
    const { lottery } = this.props;

    const finalValues = values;

    if (lottery) {
      finalValues._id = lottery._id;
    }

    return {
      _id: finalValues._id,
      ...this.state.lottery
    };
  };

  onChangeInput = e => {
    const name = e.target.name;
    let value = e.target.value;
    if (e.target.type === 'number') {
      value = Number(value);
    }

    this.setState({ lottery: { ...this.state.lottery, [name]: value } } as any);
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
    const { lottery } = this.state;
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    this.setState({ lottery: { ...lottery, [name]: value } });
  };

  onChangeOwnerId = ownerId => {
    const { lottery } = this.state;
    this.setState({ lottery: { ...lottery, ownerId } });
  };

  renderOwner = () => {
    const { lottery } = this.state;
    if (lottery.ownerType === 'customer') {
      return (
        <SelectCustomers
          label="Customer"
          name="ownerId"
          multi={false}
          initialValue={lottery.ownerId}
          onSelect={this.onChangeOwnerId}
        />
      );
    }

    if (lottery.ownerType === 'user') {
      return (
        <SelectTeamMembers
          label="Team member"
          name="ownerId"
          multi={false}
          initialValue={lottery.ownerId}
          onSelect={this.onChangeOwnerId}
        />
      );
    }

    return (
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={lottery.ownerId}
        onSelect={this.onChangeOwnerId}
      />
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { lottery } = this.state;
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Campaign</ControlLabel>
            <SelectCampaigns
              queryName="lotteryCampaigns"
              customQuery={queries.lotteryCampaigns}
              label="Choose lottery campaign"
              name="campaignId"
              onSelect={this.onChangeSelect}
              initialValue={lottery.campaignId}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Number</ControlLabel>
            <FormControl
              {...formProps}
              name="number"
              defaultValue={lottery.number}
              required={true}
              onChange={this.onChangeSelect}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Owner type</ControlLabel>
            <FormControl
              {...formProps}
              name="ownerType"
              componentClass="select"
              defaultValue={lottery.ownerType}
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
              defaultValue={lottery.status}
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
              initialValue={lottery.voucherCampaignId}
              filterParams={{ voucherType: 'lottery' }}
            />
          </FormGroup>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'lottery',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.lottery
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default LotteryForm;
