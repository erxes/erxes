import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import {
  SidebarContent,
  SidebarCounter,
  SidebarList
} from 'modules/layout/styles';
import {
  Button,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { ButtonWrapper } from 'modules/customers/components/detail/sidebar/styles';

const propTypes = {
  company: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func
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
  }

  save() {
    const doc = {
      name: document.getElementById('name').value,
      size: document.getElementById('size').value,
      website: document.getElementById('website').value,
      industry: document.getElementById('industry').value,
      plan: document.getElementById('plan').value
    };

    this.props.save(doc, error => {
      if (error) return Alert.error(error.message);

      this.cancelEditing();
      return Alert.success('Success');
    });
  }

  toggleEditing() {
    this.setState({ editing: true });
  }

  cancelEditing() {
    this.setState({
      editing: false
    });
  }

  renderInfo() {
    const { __ } = this.context;
    const { company } = this.props;
    const { Title, QuickButtons } = Sidebar.Section;

    return (
      <Sidebar.Section>
        <Title>{__('Basic Info')}</Title>

        <QuickButtons>
          <a tabIndex={0} onClick={this.toggleEditing}>
            <Icon icon="edit" />
          </a>
        </QuickButtons>

        <SidebarContent>
          <SidebarList>
            <li>
              {__('Name:')}
              <SidebarCounter>{company.name || 'N/A'}</SidebarCounter>
            </li>
            <li>
              {__('Size:')}
              <SidebarCounter>{company.size || 'N/A'}</SidebarCounter>
            </li>
            <li>
              {__('Website:')}
              <SidebarCounter>{company.website || 'N/A'}</SidebarCounter>
            </li>
            <li>
              {__('Industry:')}
              <SidebarCounter>{company.industry || 'N/A'}</SidebarCounter>
            </li>
            <li>
              {__('Plan:')}
              <SidebarCounter>{company.plan || 'N/A'}</SidebarCounter>
            </li>
          </SidebarList>
        </SidebarContent>
      </Sidebar.Section>
    );
  }

  renderForm() {
    const { __ } = this.context;
    const { company } = this.props;

    return (
      <Sidebar.Section>
        <SidebarContent>
          <br />
          <FormGroup>
            {__('Name:')}
            <FormControl id="name" defaultValue={company.name || ''} />
          </FormGroup>
          <FormGroup>
            {__('Size:')}
            <FormControl id="size" defaultValue={company.size || ''} />
          </FormGroup>
          <FormGroup>
            {__('Website:')}
            <FormControl id="website" defaultValue={company.website || ''} />
          </FormGroup>
          <FormGroup>
            {__('Industry:')}
            <FormControl id="industry" defaultValue={company.industry || ''} />
          </FormGroup>
          <FormGroup>
            {__('Plan:')}
            <FormControl id="plan" defaultValue={company.plan || ''} />
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
      </Sidebar.Section>
    );
  }

  render() {
    return this.state.editing ? this.renderForm() : this.renderInfo();
  }
}

BasicInfo.propTypes = propTypes;
BasicInfo.contextTypes = contextTypes;

export default BasicInfo;
