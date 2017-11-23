import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarContent, QuickButton } from 'modules/layout/styles';
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

    const { customer } = this.props;
    this.defaultBasicinfos = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone
    };

    this.state = {
      editing: false,
      ...this.defaultBasicinfos
    };

    this.toggleEditing = this.toggleEditing.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  toggleEditing() {
    this.cancelEditing();
    this.setState({ editing: true });
  }

  cancelEditing() {
    this.setState({
      editing: false,
      ...this.defaultBasicinfos
    });
  }

  save() {
    const doc = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      phone: this.state.phone
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

      this.defaultBasicinfos = this.state.basicInfo;
      this.cancelEditing();
      return Alert.success('Success');
    });
  }

  handleChange(e, inputname) {
    this.setState({ [inputname]: e.target.value });
  }

  renderForm() {
    return (
      <SidebarContent>
        <br />
        <FormGroup>
          First name:
          <FormControl
            defaultValue={this.state.firstName}
            onChange={e => this.handleChange(e, 'firstName')}
          />
        </FormGroup>
        <FormGroup>
          Last name:
          <FormControl
            defaultValue={this.state.lastName}
            onChange={e => this.handleChange(e, 'lastName')}
          />
        </FormGroup>
        <FormGroup>
          Primary Email:
          <FormControl
            defaultValue={this.state.email}
            onChange={e => this.handleChange(e, 'email')}
          />
        </FormGroup>
        <FormGroup>
          Phone:
          <FormControl
            defaultValue={this.state.phone}
            onChange={e => this.handleChange(e, 'phone')}
          />
        </FormGroup>
        <ButtonWrapper>
          <Button btnStyle="success" size="small" onClick={this.save}>
            <Icon icon="checkmark" />
          </Button>
          <Button btnStyle="simple" size="small" onClick={this.cancelEditing}>
            <Icon icon="close" />
          </Button>
        </ButtonWrapper>
      </SidebarContent>
    );
  }

  renderName() {
    if (this.state.firstName || this.state.lastName) {
      return (this.state.firstName || '') + ' ' + (this.state.lastName || '');
    }
    return <a onClick={this.toggleEditing}>Edit name</a>;
  }

  renderInfo() {
    const { customer } = this.props;
    const isUser = customer.isUser;
    return (
      <SidebarContent>
        <NameWrapper>
          <AvatarWrapper isUser={isUser}>
            <NameCard.Avatar customer={customer} size={50} />
            {isUser ? <Icon icon="checkmark" /> : <Icon icon="minus" />}
          </AvatarWrapper>
          <div className="cutomer-name">{this.renderName()}</div>
          <QuickButton>
            <Icon icon="edit" onClick={this.toggleEditing} />
          </QuickButton>
        </NameWrapper>
        <AboutWrapper>
          <AboutList>
            <li>
              Email:
              <Aboutvalues>
                {this.state.email || (
                  <a onClick={this.toggleEditing}>Add Email</a>
                )}
              </Aboutvalues>
            </li>
            <li>
              Phone:
              <Aboutvalues>
                {this.state.phone || (
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

export default BasicInfo;
