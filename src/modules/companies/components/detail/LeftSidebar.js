import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { GenerateField } from 'modules/fields/components';
import { CustomerForm } from 'modules/customers/components';
import { Link } from 'react-router-dom';
import { SidebarContent } from 'modules/layout/styles';
import { Alert } from 'modules/common/utils';
import {
  ModalTrigger,
  Button,
  Icon,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { CustomersWrapper, CustomerWrapper } from '../../styles';

const propTypes = {
  company: PropTypes.object.isRequired,
  customFields: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  addCustomer: PropTypes.func.isRequired
};

class LeftSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.defaultBasicinfos = {
      ...(props.company || {})
    };

    this.defaultCustomFieldsData = {
      ...(props.company.customFieldsData || {})
    };

    this.state = {
      editing: false,
      basicinfo: this.defaultBasicinfos,
      customData: this.defaultCustomFieldsData
    };

    this.toggleEditing = this.toggleEditing.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFieldsChange = this.handleFieldsChange.bind(this);
  }

  toggleEditing() {
    this.cancelEditing();
    this.setState({ editing: true });
  }

  cancelEditing() {
    this.setState({
      editing: false,
      basicinfo: this.defaultBasicinfos,
      customData: this.defaultCustomFieldsData
    });
  }

  save() {
    const doc = {
      name: this.state.basicinfo.name,
      size: this.state.basicinfo.size,
      industry: this.state.basicinfo.industry,
      website: this.state.basicinfo.website,
      plan: this.state.basicinfo.plan,
      customFieldsData: this.state.customData
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

      this.defaultBasicinfos = this.state.basicinfo;
      this.defaultCustomFieldsData = this.state.customData;
      this.cancelEditing();
      return Alert.success('Success');
    });
  }

  handleChange(e, inputname) {
    this.toggleEditing();
    const { basicinfo } = this.state;
    const newinfo = {
      ...basicinfo,
      [inputname]: e.target.value
    };
    this.setState({ basicinfo: newinfo });
  }

  handleFieldsChange({ _id, value }) {
    this.toggleEditing();
    const { customData } = this.state;
    const newfields = {
      ...customData,
      [_id]: value
    };
    this.setState({ customData: newfields });
  }

  renderBasicInfo() {
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section className="full">
        <Title>Basic info</Title>

        <SidebarContent>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              id="name"
              onChange={e => this.handleChange(e, 'name')}
              value={this.state.basicinfo.name}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Size</ControlLabel>
            <FormControl
              id="size"
              type="number"
              onChange={e => this.handleChange(e, 'size')}
              value={this.state.basicinfo.size || ''}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Industry</ControlLabel>
            <FormControl
              id="industry"
              onChange={e => this.handleChange(e, 'industry')}
              value={this.state.basicinfo.industry || ''}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Website</ControlLabel>
            <FormControl
              id="website"
              onChange={e => this.handleChange(e, 'website')}
              value={this.state.basicinfo.website || ''}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Plan</ControlLabel>
            <FormControl
              id="plan"
              onChange={e => this.handleChange(e, 'plan')}
              value={this.state.basicinfo.plan || ''}
            />
          </FormGroup>
        </SidebarContent>
      </Section>
    );
  }

  renderCustomFields() {
    const { customFields } = this.props;
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;

    return (
      <Section className="full">
        <Title>About</Title>
        <QuickButtons>
          <Link to="/fields/manage/company">
            <Icon icon="gear-a" />
          </Link>
        </QuickButtons>
        <SidebarContent>
          {customFields.map((field, index) => (
            <GenerateField
              field={field}
              key={index}
              onValueChange={this.handleFieldsChange}
              defaultValue={this.state.customData[field._id] || ''}
            />
          ))}
        </SidebarContent>
      </Section>
    );
  }

  renderCustomers() {
    const { company, addCustomer } = this.props;
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;

    return (
      <Section className="full">
        <Title>Customers</Title>

        <QuickButtons>
          <ModalTrigger title="New Customer" trigger={<Icon icon="plus" />}>
            <CustomerForm addCustomer={addCustomer} />
          </ModalTrigger>
        </QuickButtons>
        <CustomersWrapper>
          {company.customers.map((customer, index) => (
            <CustomerWrapper key={index}>
              <Link to={'/customers/details/' + customer._id}>
                <Icon icon="android-arrow-forward" />
              </Link>
              <span>Name: </span>
              <span>
                {(customer.firstName || '') + ' ' + (customer.lastName || '')}
              </span>
            </CustomerWrapper>
          ))}
        </CustomersWrapper>
      </Section>
    );
  }

  renderSidebarFooter() {
    if (!this.state.editing) {
      return null;
    }

    return (
      <Sidebar.Footer>
        <Button btnStyle="simple" size="small" onClick={this.cancelEditing}>
          <Icon icon="close" />Discard
        </Button>
        <Button btnStyle="success" size="small" onClick={this.save}>
          <Icon icon="checkmark" />Save
        </Button>
      </Sidebar.Footer>
    );
  }

  render() {
    return (
      <Sidebar size="wide" footer={this.renderSidebarFooter()}>
        {this.renderBasicInfo()}
        {this.renderCustomers()}
        {this.renderCustomFields()}
      </Sidebar>
    );
  }
}

LeftSidebar.propTypes = propTypes;

export default LeftSidebar;
