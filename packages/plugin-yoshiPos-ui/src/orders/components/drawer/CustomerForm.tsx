import React from 'react';

import { Alert, __ } from '../../../common/utils';
import Button from '../../../common/components/Button';
import FormGroup from '../../../common/components/form/Group';
import FormControl from '../../../common/components/form/Control';
import ControlLabel from '../../../common/components/form/Label';
import { ICustomerParams } from '../../../orders/types';

type Props = {
  addCustomer: (params: ICustomerParams) => void;
  onChangeProductBodyType: (type: string) => void;
};

export default class CustomerForm extends React.Component<
  Props,
  ICustomerParams
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      phone: '',
      email: ''
    };
  }

  onSubmit(e) {
    e.preventDefault();

    const { addCustomer, onChangeProductBodyType } = this.props;
    const { firstName, lastName, phone } = this.state;

    if (!(firstName || lastName || phone)) {
      return Alert.warning('Please type first name & last name & phone number');
    }

    addCustomer({ ...this.state });
    onChangeProductBodyType('customer');
  }

  onChange(e, field: string) {
    const value = e.target.value;

    this.setState({ [field]: value } as Pick<
      ICustomerParams,
      keyof ICustomerParams
    >);
  }

  render() {
    return (
      <form onSubmit={e => this.onSubmit(e)}>
        <FormGroup>
          <ControlLabel required={true}>{__('Last name')}</ControlLabel>
          <FormControl
            name="lastName"
            onChange={e => this.onChange(e, 'lastName')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__('First name')}</ControlLabel>
          <FormControl
            name="firstName"
            onChange={e => this.onChange(e, 'firstName')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__('Phone number')}</ControlLabel>
          <FormControl
            name="phone"
            onChange={e => this.onChange(e, 'phone')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Email address')}</ControlLabel>
          <FormControl name="email" onChange={e => this.onChange(e, 'email')} />
        </FormGroup>
        <Button type="submit" btnStyle="success">
          {__('Register')}
        </Button>
      </form>
    );
  }
}
