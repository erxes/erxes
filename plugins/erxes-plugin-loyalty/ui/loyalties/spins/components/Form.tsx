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
import { ISpin, ISpinDoc } from '../types';
import { ISpinCompaign } from '../../../configs/spinCompaign/types';


type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  compaigns: ISpinCompaign[];
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

    const { spin = {} as ISpin, queryParams, compaigns } = this.props;

    if (!spin.compaignId) {
      spin.compaignId = queryParams.compaignId || compaigns.length && compaigns[0]._id;
    }

    if (!spin.ownerType) {
      spin.ownerType = 'customer';
    }

    this.state = {
      spin: spin
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

    this.setState({ spin: { ...this.state.spin, [name]: value } } as any)
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
    const { spin } = this.state;
    const target = (e.currentTarget as HTMLInputElement);
    const value = target.value;
    const name = target.name;

    this.setState({ spin: { ...spin, [name]: value } })
  }

  onChangeOwnerId = (ownerId) => {
    const { spin } = this.state;
    this.setState({ spin: { ...spin, ownerId } })
  }

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
      )
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
      )
    }

    return (
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={spin.ownerId}
        onSelect={this.onChangeOwnerId}
      />
    )
  }

  renderContent = (formProps: IFormProps) => {
    const { spin } = this.state;
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
              defaultValue={spin.compaignId}
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
              defaultValue={spin.ownerType}
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
