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
import { IDonate, IDonateDoc } from '../types';
import { IDonateCompaign } from '../../../configs/donateCompaign/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  compaigns: IDonateCompaign[];
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

    const { donate = {} as IDonate, queryParams, compaigns } = this.props;

    if (!donate.compaignId) {
      donate.compaignId = queryParams.compaignId || compaigns.length && compaigns[0]._id;
    }

    if (!donate.ownerType) {
      donate.ownerType = 'customer';
    }

    this.state = {
      donate: donate
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

    this.setState({ donate: { ...this.state.donate, [name]: value } } as any)
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
    const { donate } = this.state;
    const target = (e.currentTarget as HTMLInputElement);
    const value = target.value;
    const name = target.name;

    this.setState({ donate: { ...donate, [name]: value } })
  }

  onChangeOwnerId = (ownerId) => {
    const { donate } = this.state;
    this.setState({ donate: { ...donate, ownerId } })
  }

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
      )
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
      )
    }

    return (
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={donate.ownerId}
        onSelect={this.onChangeOwnerId}
      />
    )
  }

  renderContent = (formProps: IFormProps) => {
    const { donate } = this.state;
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
              defaultValue={donate.compaignId}
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
              defaultValue={donate.ownerType}
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
