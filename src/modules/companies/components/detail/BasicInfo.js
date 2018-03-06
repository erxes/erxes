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
    const { company } = this.props;
    const { Title, QuickButtons } = Sidebar.Section;

    return (
      <Sidebar.Section>
        <Title>Basic Info</Title>

        <QuickButtons>
          <a tabIndex={0} onClick={this.toggleEditing}>
            <Icon icon="edit" />
          </a>
        </QuickButtons>

        <SidebarContent>
          <SidebarList>
            <li>
              Name:
              <SidebarCounter>{company.name || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Size:
              <SidebarCounter>{company.size || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Website:
              <SidebarCounter>{company.website || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Industry:
              <SidebarCounter>{company.industry || 'N/A'}</SidebarCounter>
            </li>
            <li>
              Plan:
              <SidebarCounter>{company.plan || 'N/A'}</SidebarCounter>
            </li>
          </SidebarList>
        </SidebarContent>
      </Sidebar.Section>
    );
  }

  renderForm() {
    const { company } = this.props;

    return (
      <Sidebar.Section>
        <SidebarContent>
          <br />
          <FormGroup>
            Name:
            <FormControl id="name" defaultValue={company.name || ''} />
          </FormGroup>
          <FormGroup>
            Size:
            <FormControl id="size" defaultValue={company.size || ''} />
          </FormGroup>
          <FormGroup>
            Website:
            <FormControl id="website" defaultValue={company.website || ''} />
          </FormGroup>
          <FormGroup>
            Industry:
            <FormControl id="industry" defaultValue={company.industry || ''} />
          </FormGroup>
          <FormGroup>
            Plan:
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

export default BasicInfo;
