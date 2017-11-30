import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
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
import { GenerateField } from 'modules/fields/components';
import { CustomerForm } from 'modules/customers/components';
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

    this.state = {
      editing: false,
      customFieldsData: this.props.company.customFieldsData || {}
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
    const { company } = this.props;

    this.setState({
      editing: false,
      name: company.name,
      size: company.size,
      website: company.website,
      industry: company.industry,
      plan: company.plan,
      customFieldsData: company.customFieldsData
    });
  }

  save() {
    const { company } = this.props;

    const doc = {
      name: this.state.name || company.name,
      size: this.state.size || company.size,
      website: this.state.website || company.website,
      industry: this.state.industry || company.industry,
      plan: this.state.plan || company.plan,
      customFieldsData: this.state.customFieldsData || company.customFieldsData
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

      this.setState({
        ...doc,
        editing: false
      });
      return Alert.success('Success');
    });
  }

  handleChange(e, inputname) {
    this.toggleEditing();
    this.setState({ [inputname]: e.target.value });
  }

  handleFieldsChange({ _id, value }) {
    this.toggleEditing();
    const { customFieldsData } = this.state;
    const newfields = {
      ...customFieldsData,
      [_id]: value
    };
    this.setState({ customFieldsData: newfields });
  }

  componentWillReceiveProps(nextProps) {
    const company = nextProps.company || {};

    this.setState({
      name: company.name || '',
      size: company.size || '',
      website: company.website || '',
      industry: company.industry || '',
      plan: company.plan || '',
      customFieldsData: company.customFieldsData || []
    });
  }

  renderBasicInfo() {
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section>
        <Title>Basic info</Title>

        <SidebarContent>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              onChange={e => this.handleChange(e, 'name')}
              value={this.state.name || ''}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Size</ControlLabel>
            <FormControl
              id="size"
              onChange={e => this.handleChange(e, 'size')}
              value={this.state.size || ''}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Industry</ControlLabel>
            <FormControl
              onChange={e => this.handleChange(e, 'industry')}
              value={this.state.industry || ''}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Website</ControlLabel>
            <FormControl
              onChange={e => this.handleChange(e, 'website')}
              value={this.state.website || ''}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Plan</ControlLabel>
            <FormControl
              onChange={e => this.handleChange(e, 'plan')}
              value={this.state.plan || ''}
            />
          </FormGroup>
        </SidebarContent>
      </Section>
    );
  }

  renderCustomFields() {
    const { customFields, company } = this.props;
    const { Section } = Sidebar;
    const { Title, QuickButtons } = Section;

    return (
      <Section>
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
              defaultValue={
                company.customFieldsData
                  ? company.customFieldsData[field._id]
                  : ''
              }
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
      <Section>
        <Title>Customers</Title>

        <QuickButtons>
          <ModalTrigger title="New Customer" trigger={<Icon icon="plus" />}>
            <CustomerForm addCustomer={addCustomer} />
          </ModalTrigger>
        </QuickButtons>
        <CustomersWrapper>
          {company.customers.map((customer, index) => (
            <CustomerWrapper key={index}>
              <Link to={`/customers/details/${customer._id}`}>
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
