import React from 'react';
import {
  __,
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  SelectCompanies,
  SelectCustomers,
  SelectTeamMembers
  } from 'erxes-ui';
import { IButtonMutateProps, IFormProps } from 'erxes-ui/lib/types';
import { ILottery, ILotteryDoc } from '../types';
import { ILotteryCompaign } from '../../../configs/lotteryCompaign/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  compaigns: ILotteryCompaign[];
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

    const { lottery = {} as ILottery, queryParams , compaigns} = this.props;

    if (!lottery.compaignId) {
      lottery.compaignId = queryParams.compaignId || compaigns.length && compaigns[0]._id;
    }

    if (!lottery.ownerType) {
      lottery.ownerType = 'customer';
    }

    this.state = {
      lottery: lottery
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

    this.setState({ lottery: { ...this.state.lottery, [name]: value } } as any)
  }

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} onChange={this.onChangeInput} />
      </FormGroup>
    );
  };

  onChangeSelect = (e) => {
    const { lottery } = this.state;
    const target = (e.currentTarget as HTMLInputElement);
    const value = target.value;
    const name = target.name;

    this.setState({ lottery: { ...lottery, [name]: value } })
  }

  onChangeOwnerId = (ownerId) => {
    const { lottery } = this.state;
    this.setState({ lottery: { ...lottery, ownerId } })
  }

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
      )
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
      )
    }

    return (
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={lottery.ownerId}
        onSelect={this.onChangeOwnerId}
      />
    )
  }

  renderContent = (formProps: IFormProps) => {
    const { lottery } = this.state;
    const { closeModal, renderButton, compaigns } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Ангилал</ControlLabel>
            <FormControl
              {...formProps}
              name="compaignId"
              componentClass="select"
              defaultValue={lottery.compaignId}
              required={true}
              onChange={this.onChangeSelect}
            >
              {compaigns.map(c => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </FormControl>
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
              <option key={'customer'} value={'customer'}> {'customer'} </option>
              <option key={'user'} value={'user'}> {'user'} </option>
              <option key={'company'} value={'company'}> {'company'} </option>
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>Owner</ControlLabel>
            {this.renderOwner()}
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
