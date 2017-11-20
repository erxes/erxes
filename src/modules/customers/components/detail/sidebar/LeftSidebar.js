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
      fieldsEditing: false,
      basicInfoEditing: false,
      basicInfo: this.defaultBasicinfos,
      fieldsData: this.defaultCustomFieldsData
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
    this.setState({ fieldsEditing: true });
  }

  toggleBasicInfoEdit() {
    this.cancelEditing();
    this.setState({ basicInfoEditing: true });
  }

  cancelEditing() {
    this.setState({
      fieldsEditing: false,
      basicInfoEditing: false,
      basicInfo: this.defaultBasicinfos,
      fieldsData: this.defaultCustomFieldsData
    });
  }

  save() {
    const doc = {
      firstName: this.state.basicInfo.firstName,
      lastName: this.state.basicInfo.lastName,
      email: this.state.basicInfo.email,
      phone: this.state.basicInfo.phone,
      customFieldsData: this.state.fieldsData
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

      this.defaultBasicinfos = this.state.basicInfo;
      this.defaultCustomFieldsData = this.state.fieldsData;
      this.cancelEditing();
      return Alert.success('Success');
    });
  }

  handleChange(e, inputname) {
    const { basicInfo } = this.state;
    const newinfo = {
      ...basicInfo,
      [inputname]: e.target.value
    };
    this.setState({ basicInfo: newinfo });
  }

  handleFieldsChange({ _id, value }) {
    this.toggleEditing();
    const { fieldsData } = this.state;
    const newfields = {
      ...fieldsData,
      [_id]: value
    };
    this.setState({ fieldsData: newfields });
  }

  renderInfo() {
    return (
      <SidebarContent>
        <FormGroup>
          First name:
          <FormControl
            defaultValue={this.state.basicInfo.firstName}
            onChange={e => this.handleChange(e, 'firstName')}
          />
        </FormGroup>
        <FormGroup>
          Last name:
          <FormControl
            defaultValue={this.state.basicInfo.lastName}
            onChange={e => this.handleChange(e, 'lastName')}
          />
        </FormGroup>
        <FormGroup>
          Primary Email:
          <FormControl
            defaultValue={this.state.basicInfo.email}
            onChange={e => this.handleChange(e, 'email')}
          />
        </FormGroup>
        <FormGroup>
          Phone:
          <FormControl
            defaultValue={this.state.basicInfo.phone}
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

  renderInfoEdit() {
    const { customer } = this.props;
    const isUser = customer.isUser;
    return (
      <SidebarContent>
        <NameWrapper>
          <AvatarWrapper isUser={isUser}>
            <NameCard.Avatar customer={customer} size={50} />
            {isUser ? <Icon icon="checkmark" /> : <Icon icon="minus" />}
          </AvatarWrapper>
          <NameWrapper>
            {this.state.basicInfo.firstName || this.state.basicInfo.lastName ? (
              (this.state.basicInfo.firstName || '') +
              ' ' +
              (this.state.basicInfo.lastName || '')
            ) : (
              <a onClick={this.toggleBasicInfoEdit}>Edit name</a>
            )}
          </NameWrapper>
          <Wrapper.Sidebar.Section.QuickButtons>
            <QuickButton>
              <Icon icon="edit" onClick={this.toggleBasicInfoEdit} />
            </QuickButton>
          </Wrapper.Sidebar.Section.QuickButtons>
        </NameWrapper>
        <AboutWrapper>
          <AboutList>
            <li>
              Email:
              <Aboutvalues>
                {this.state.basicInfo.email || (
                  <a onClick={this.toggleBasicInfoEdit}>Add Email</a>
                )}
              </Aboutvalues>
            </li>
            <li>
              Phone:
              <Aboutvalues>
                {this.state.basicInfo.phone || (
                  <a onClick={this.toggleBasicInfoEdit}>Add Phone</a>
                )}
              </Aboutvalues>
            </li>
          </AboutList>
        </AboutWrapper>
      </SidebarContent>
    );
  }

  renderCompanies() {
    const { addCompany, customer } = this.props;

    return (
      <Wrapper.Sidebar.Section className="full">
        <Wrapper.Sidebar.Section.Title>Companies</Wrapper.Sidebar.Section.Title>

        <CompaniesWrapper>
          <Wrapper.Sidebar.Section.QuickButtons>
            <ModalTrigger title="New company" trigger={<Icon icon="plus" />}>
              <CompanyForm addCompany={addCompany} />
            </ModalTrigger>
          </Wrapper.Sidebar.Section.QuickButtons>
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
      </Wrapper.Sidebar.Section>
    );
  }

  renderCustomFields() {
    const { customFields } = this.props;

    return (
      <Wrapper.Sidebar.Section className="full">
        <Wrapper.Sidebar.Section.Title>About</Wrapper.Sidebar.Section.Title>
        <Wrapper.Sidebar.Section.QuickButtons>
          <Link to="/fields/manage/customer">
            <Icon icon="gear-a" />
          </Link>
        </Wrapper.Sidebar.Section.QuickButtons>
        <SidebarContent>
          <AboutList>
            {customFields.map((field, index) => (
              <GenerateField
                field={field}
                key={index}
                onValueChange={this.handleFieldsChange}
                defaultValue={this.state.fieldsData[field._id] || ''}
              />
            ))}
          </AboutList>
        </SidebarContent>
      </Wrapper.Sidebar.Section>
    );
  }

  renderSidebarFooter() {
    return this.state.fieldsEditing ? (
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
        <Wrapper.Sidebar.Section className="full">
          {this.state.basicInfoEditing
            ? this.renderInfo()
            : this.renderInfoEdit()}
        </Wrapper.Sidebar.Section>
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
