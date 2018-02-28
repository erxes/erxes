import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarContent } from 'modules/layout/styles';
import { AvatarWrapper } from 'modules/activityLogs/styles';
import {
  Button,
  Icon,
  FormControl,
  FormGroup,
  NameCard
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import {
  AboutList,
  Aboutvalues,
  NameWrapper,
  ButtonWrapper,
  AboutWrapper
} from './styles';

const propTypes = {
  customer: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
};

class BasicInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };

    this.toggleEditing = this.toggleEditing.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const { customer } = newProps;
    const oldcustomer = this.props.customer;
    if (customer._id !== oldcustomer._id) {
      this.cancelEditing();
    }
  }

  toggleEditing() {
    this.cancelEditing();
    this.setState({ editing: true });
  }

  cancelEditing() {
    const { customer } = this.props;

    this.setState({
      editing: false,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone
    });
  }

  save() {
    const { customer } = this.props;

    const doc = {
      firstName: this.state.firstName || customer.firstName,
      lastName: this.state.lastName || customer.lastName,
      email: this.state.email || customer.email,
      phone: this.state.phone || customer.phone
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

      this.cancelEditing();
      return Alert.success('Success');
    });
  }

  handleChange(e, inputname) {
    this.setState({ [inputname]: e.target.value });
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
          <FormControl
            defaultValue={customer.firstName}
            onChange={e => this.handleChange(e, 'firstName')}
          />
        </FormGroup>
        <FormGroup>
          {__('Last name')}:
          <FormControl
            defaultValue={customer.lastName}
            onChange={e => this.handleChange(e, 'lastName')}
          />
        </FormGroup>
        <FormGroup>
          {__('Primary Email')}:
          <FormControl
            defaultValue={
              customer.email || this.getVisitorInfo(customer, 'email')
            }
            onChange={e => this.handleChange(e, 'email')}
          />
        </FormGroup>
        <FormGroup>
          {__('Phone')}:
          <FormControl
            defaultValue={
              customer.phone || this.getVisitorInfo(customer, 'phone')
            }
            onChange={e => this.handleChange(e, 'phone')}
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
      <SidebarContent>
        <NameWrapper>
          <AvatarWrapper isUser={isUser}>
            <NameCard.Avatar customer={customer} size={50} />
            {isUser ? <Icon icon="checkmark" /> : <Icon icon="minus" />}
          </AvatarWrapper>
          <div className="cutomer-name">
            {customer.name || this.renderName(customer)}
          </div>
          <a>
            <Icon icon="edit" onClick={this.toggleEditing} />
          </a>
        </NameWrapper>
        <AboutWrapper>
          <AboutList>
            <li>
              {__('Email')}:
              <Aboutvalues>
                {customer.email ||
                  this.getVisitorInfo(customer, 'email') || (
                    <a onClick={this.toggleEditing}>Add Email</a>
                  )}
              </Aboutvalues>
            </li>
            <li>
              {__('Phone')}:
              <Aboutvalues>
                {customer.phone ||
                  this.getVisitorInfo(customer, 'phone') || (
                    <a onClick={this.toggleEditing}>Add Phone</a>
                  )}
              </Aboutvalues>
            </li>
          </AboutList>
        </AboutWrapper>
      </SidebarContent>
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
  __: PropTypes.func
};

export default BasicInfo;
