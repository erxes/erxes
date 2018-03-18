import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import {
  SidebarContent,
  SidebarCounter,
  SidebarList,
} from 'modules/layout/styles';
import { AvatarWrapper } from 'modules/activityLogs/styles';
import {
  Button,
  Icon,
  FormControl,
  FormGroup,
  NameCard,
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { NameWrapper, ButtonWrapper } from './styles';

const propTypes = {
  customer: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
};

class BasicInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
    };

    this.toggleEditing = this.toggleEditing.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.save = this.save.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const { customer } = newProps;
    const oldcustomer = this.props.customer;
    if (customer._id !== oldcustomer._id) {
      this.cancelEditing();
    }
  }

  toggleEditing() {
    this.setState({ editing: true });
  }

  cancelEditing() {
    this.setState({
      editing: false,
    });
  }

  save() {
    const doc = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

      this.cancelEditing();
      return Alert.success('Success');
    });
  }

  getVisitorInfo(customer, key) {
    return customer.visitorContactInfo && customer.visitorContactInfo[key];
  }

  renderForm() {
    const { customer } = this.props;
    const { __ } = this.context;

    return (
      <SidebarContent>
        <br />
        <FormGroup>
          {__('First name')}:
          <FormControl defaultValue={customer.firstName} id="firstName" />
        </FormGroup>
        <FormGroup>
          {__('Last name')}:
          <FormControl defaultValue={customer.lastName} id="lastName" />
        </FormGroup>
        <FormGroup>
          {__('Primary Email')}:
          <FormControl
            id="email"
            defaultValue={
              customer.email || this.getVisitorInfo(customer, 'email')
            }
          />
        </FormGroup>
        <FormGroup>
          {__('Phone')}:
          <FormControl
            id="phone"
            defaultValue={
              customer.phone || this.getVisitorInfo(customer, 'phone')
            }
          />
        </FormGroup>
        <ButtonWrapper>
          <Button
            btnStyle="success"
            size="small"
            onClick={this.save}
            icon="checkmark"
          />
          <Button
            btnStyle="simple"
            size="small"
            onClick={this.cancelEditing}
            icon="close"
          />
        </ButtonWrapper>
      </SidebarContent>
    );
  }

  renderName(customer) {
    const { __ } = this.context;
    if (customer.firstName || customer.lastName) {
      return (customer.firstName || '') + ' ' + (customer.lastName || '');
    }
    return <a onClick={this.toggleEditing}>{__('Edit name')}</a>;
  }

  renderInfo() {
    const { customer } = this.props;
    const isUser = customer.isUser;
    const { __ } = this.context;

    return (
      <Fragment>
        <SidebarContent>
          <NameWrapper>
            <AvatarWrapper isUser={isUser}>
              <NameCard.Avatar customer={customer} size={50} />
              {isUser ? <Icon icon="checkmark" /> : <Icon icon="minus" />}
            </AvatarWrapper>
            <div className="customer-name">
              {customer.name || this.renderName(customer)}
            </div>
            <a>
              <Icon icon="edit" onClick={this.toggleEditing} />
            </a>
          </NameWrapper>
        </SidebarContent>
        <SidebarList className="no-link">
          <li>
            {__('Email')}:
            <SidebarCounter>
              {customer.email ||
                this.getVisitorInfo(customer, 'email') || (
                  <a onClick={this.toggleEditing}>{__('Add Email')}</a>
                )}
            </SidebarCounter>
          </li>
          <li>
            {__('Phone')}:
            <SidebarCounter>
              {customer.phone ||
                this.getVisitorInfo(customer, 'phone') || (
                  <a onClick={this.toggleEditing}>{__('Add Phone')}</a>
                )}
            </SidebarCounter>
          </li>
        </SidebarList>
      </Fragment>
    );
  }

  render() {
    return (
      <Sidebar.Section>
        {this.state.editing ? this.renderForm() : this.renderInfo()}
      </Sidebar.Section>
    );
  }
}

BasicInfo.propTypes = propTypes;
BasicInfo.contextTypes = {
  __: PropTypes.func,
};

export default BasicInfo;
