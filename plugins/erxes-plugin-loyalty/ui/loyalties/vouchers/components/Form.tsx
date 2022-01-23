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
import { IVoucher, IVoucherDoc } from '../types';
import { IVoucherCompaign } from '../../../configs/voucherCompaign/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  compaigns: IVoucherCompaign[];
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

    if (!voucher.compaignId && queryParams.compaignId) {
      voucher.compaignId = queryParams.compaignId;
    }

    if (!voucher.ownerType) {
      voucher.ownerType = 'customer';
    }

    this.state = {
      voucher: voucher
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

    this.setState({ voucher: { ...this.state.voucher, [name]: value } } as any)
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
    const { voucher } = this.state;
    const target = (e.currentTarget as HTMLInputElement);
    const value = target.value;
    const name = target.name;

    this.setState({ voucher: { ...voucher, [name]: value } })
  }

  onChangeOwnerId = (ownerId) => {
    const { voucher } = this.state;
    this.setState({ voucher: { ...voucher, ownerId } })
  }

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
      )
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
      )
    }

    return (
      <SelectCompanies
        label="Company"
        name="ownerId"
        multi={false}
        initialValue={voucher.ownerId}
        onSelect={this.onChangeOwnerId}
      />
    )
  }

  renderContent = (formProps: IFormProps) => {
    const { voucher } = this.state;
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
              defaultValue={voucher.compaignId}
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
              defaultValue={voucher.ownerType}
              required={true}
              onChange={this.onChangeSelect}
            >
              <option key={'customer'} value={'customer'}> {'customer'} </option>
              <option key={'user'} value={'user'}> {'user'} </option>
              <option key={'company'} value={'company'}> {'company'} </option>
            </FormControl>
          </FormGroup>

          {this.renderOwner()}
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
