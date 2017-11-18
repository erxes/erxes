import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarContent, QuickButton } from 'modules/layout/styles';
import { AvatarWrapper } from 'modules/activityLogs/styles';
import { GenerateField } from 'modules/fields/components';
import {
  ModalTrigger,
  Button,
  Icon,
  FormControl,
  FormGroup,
  NameCard
} from 'modules/common/components';
import { CompanyForm } from 'modules/companies/components';
import { Link } from 'react-router-dom';
import {
  TaggerSection,
  MessengerSection,
  TwitterSection,
  FacebookSection
} from './';
import { Alert } from 'modules/common/utils';
import {
  AboutList,
  Aboutvalues,
  NameWrapper,
  ButtonWrapper,
  AboutWrapper,
  CompaniesWrapper,
  CompanyWrapper
} from '../../../styles';

const propTypes = {
  customer: PropTypes.object.isRequired,
  customFields: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  addCompany: PropTypes.func.isRequired
};

class LeftSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.defaultBasicinfos = {
      ...(props.customer || {})
    };
    this.defaultCustomFieldsData = {
      ...(props.customer.customFieldsData || {})
    };

    this.state = {
      fieldsediting: false,
      basicinfoediting: false,
      basicinfo: this.defaultBasicinfos,
      fieldsdata: this.defaultCustomFieldsData
    };

    this.toggleEditing = this.toggleEditing.bind(this);
    this.toggleBasicInfoEdit = this.toggleBasicInfoEdit.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFieldsChange = this.handleFieldsChange.bind(this);
  }

  toggleEditing() {
    this.cancelEditing();
    this.setState({ fieldsediting: true });
  }

  toggleBasicInfoEdit() {
    this.cancelEditing();
    this.setState({ basicinfoediting: true });
  }

  cancelEditing() {
    this.setState({
      fieldsediting: false,
      basicinfoediting: false,
      basicinfo: this.defaultBasicinfos,
      fieldsdata: this.defaultCustomFieldsData
    });
  }

  save() {
    const doc = {
      firstName: this.state.basicinfo.firstName,
      lastName: this.state.basicinfo.lastName,
      email: this.state.basicinfo.email,
      phone: this.state.basicinfo.phone,
      customFieldsData: this.state.fieldsdata
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

      this.defaultBasicinfos = this.state.basicinfo;
      this.defaultCustomFieldsData = this.state.fieldsdata;
      this.cancelEditing();
      return Alert.success('Success');
    });
  }

  handleChange(e, inputname) {
    const { basicinfo } = this.state;
    const newinfo = {
      ...basicinfo,
      [inputname]: e.target.value
    };
    this.setState({ basicinfo: newinfo });
  }

  handleFieldsChange({ _id, value }) {
    this.toggleEditing();
    const { fieldsdata } = this.state;
    const newfields = {
      ...fieldsdata,
      [_id]: value
    };
    this.setState({ fieldsdata: newfields });
  }

  renderBasicInfo() {
    const { customer } = this.props;
    const isUser = customer.isUser;
    const { Sidebar } = Wrapper;
    const { Section } = Sidebar;
    const { QuickButtons } = Section;

    return this.state.basicinfoediting ? (
      <Section className="full">
        <SidebarContent>
          <br />
          <FormGroup>
            First name:
            <FormControl
              defaultValue={this.state.basicinfo.firstName}
              onChange={e => this.handleChange(e, 'firstName')}
            />
          </FormGroup>
          <FormGroup>
            Last name:
            <FormControl
              defaultValue={this.state.basicinfo.lastName}
              onChange={e => this.handleChange(e, 'lastName')}
            />
          </FormGroup>
          <FormGroup>
            Primary Email:
            <FormControl
              defaultValue={this.state.basicinfo.email}
              onChange={e => this.handleChange(e, 'email')}
            />
          </FormGroup>
          <FormGroup>
            Phone:
            <FormControl
              defaultValue={this.state.basicinfo.phone}
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
      </Section>
    ) : (
      <Section className="full">
        <SidebarContent>
          <NameWrapper>
            <AvatarWrapper isUser={isUser}>
              <NameCard.Avatar customer={customer} size={50} />
              {isUser ? <Icon icon="checkmark" /> : <Icon icon="minus" />}
            </AvatarWrapper>
            <NameWrapper>
              {this.state.basicinfo.firstName ||
              this.state.basicinfo.lastName ? (
                (this.state.basicinfo.firstName || '') +
                ' ' +
                (this.state.basicinfo.lastName || '')
              ) : (
                <a onClick={this.toggleBasicInfoEdit}>Edit name</a>
              )}
            </NameWrapper>
            <QuickButtons>
              <QuickButton>
                <Icon icon="edit" onClick={this.toggleBasicInfoEdit} />
              </QuickButton>
            </QuickButtons>
          </NameWrapper>
          <AboutWrapper>
            <AboutList>
              <li>
                Email:
                <Aboutvalues>
                  {this.state.basicinfo.email || (
                    <a onClick={this.toggleBasicInfoEdit}>Add Email</a>
                  )}
                </Aboutvalues>
              </li>
              <li>
                Phone:
                <Aboutvalues>
                  {this.state.basicinfo.phone || (
                    <a onClick={this.toggleBasicInfoEdit}>Add Phone</a>
                  )}
                </Aboutvalues>
              </li>
            </AboutList>
          </AboutWrapper>
        </SidebarContent>
      </Section>
    );
  }

  renderCompanies() {
    const { addCompany, customer } = this.props;
    const { Sidebar } = Wrapper;
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;

    return (
      <Section className="full">
        <Title>Companies</Title>

        <CompaniesWrapper>
          <QuickButtons>
            <ModalTrigger title="New company" trigger={<Icon icon="plus" />}>
              <CompanyForm addCompany={addCompany} />
            </ModalTrigger>
          </QuickButtons>
          {customer.companies.map((company, index) => (
            <CompanyWrapper key={index}>
              <Link to={'/companies/details/' + company._id}>
                <Icon icon="android-arrow-forward" />
              </Link>
              <span>{company.name || 'N/A'}</span>
              <span>{company.website}</span>
            </CompanyWrapper>
          ))}
        </CompaniesWrapper>
      </Section>
    );
  }

  renderCustomFields() {
    const { customFields } = this.props;
    const { Sidebar } = Wrapper;
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;

    return (
      <Section className="full">
        <Title>About</Title>
        <QuickButtons>
          <Link to="/fields/manage/customer">
            <Icon icon="gear-a" />
          </Link>
        </QuickButtons>
        <SidebarContent>
          <AboutList>
            {customFields.map((field, index) => (
              <GenerateField
                field={field}
                key={index}
                onValueChange={this.handleFieldsChange}
                value={this.state.fieldsdata[field._id] || ''}
              />
            ))}
          </AboutList>
        </SidebarContent>
      </Section>
    );
  }

  renderSidebarFooter() {
    return this.state.fieldsediting ? (
      <Wrapper.Sidebar.Footer>
        <Button btnStyle="simple" size="small" onClick={this.cancelEditing}>
          <Icon icon="close" />Discard
        </Button>
        <Button btnStyle="success" size="small" onClick={this.save}>
          <Icon icon="checkmark" />Save
        </Button>
      </Wrapper.Sidebar.Footer>
    ) : null;
  }

  render() {
    const { customer } = this.props;

    return (
      <Wrapper.Sidebar size="wide" footer={this.renderSidebarFooter()}>
        {this.renderBasicInfo()}
        {this.renderCustomFields()}
        {this.renderCompanies()}

        <MessengerSection customer={customer} />
        <TwitterSection customer={customer} />
        <FacebookSection customer={customer} />
        <TaggerSection customer={customer} />
      </Wrapper.Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;

export default LeftSidebar;
