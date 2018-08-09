import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SidebarContent } from '../styles';
import GenerateField from './GenerateField';

class GenerateGroup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      data: props.data
    };

    this.toggleEditing = this.toggleEditing.bind(this);
    this.onChange = this.onChange.bind(this);
    this.save = this.save.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
  }

  save() {
    const { data } = this.state;
    const { save } = this.props;

    save(data, error => {
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

  onChange({ _id, value }) {
    const { data } = this.state;

    this.setState({ data: { ...data, [_id]: value } });
    this.toggleEditing();
  }

  renderButtons() {
    if (!this.state.editing) {
      return null;
    }

    return (
      <Sidebar.Footer>
        <Button
          btnStyle="simple"
          size="small"
          onClick={this.cancelEditing}
          icon="cancel-1"
        >
          Discard
        </Button>
        <Button
          btnStyle="success"
          size="small"
          onClick={this.save}
          icon="checked-1"
        >
          Save
        </Button>
      </Sidebar.Footer>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { Title } = Section;

    const { fieldGroup } = this.props;
    const { data } = this.state;

    if (!fieldGroup.isVisible) return null;

    return (
      <Section>
        <Title>{fieldGroup.name}</Title>

        <SidebarContent>
          {fieldGroup.fields.map((field, index) => {
            if (!field.isVisible) return null;

            return (
              <GenerateField
                field={field}
                name={field._id}
                key={index}
                onValueChange={({ _id, value }) =>
                  this.onChange({ _id, value })
                }
                defaultValue={data[field._id] || ''}
              />
            );
          })}
        </SidebarContent>

        {this.renderButtons()}
      </Section>
    );
  }
}

GenerateGroup.propTypes = {
  fieldGroup: PropTypes.object.isRequired,
  data: PropTypes.object,
  save: PropTypes.func.isRequired
};

class GenerateGroups extends React.Component {
  constructor(props) {
    super(props);

    this.saveGroup = this.saveGroup.bind(this);
  }

  saveGroup(groupData, callback) {
    const { customFieldsData, save } = this.props;

    const updatedData = {
      ...(customFieldsData || {}),
      ...(groupData || {})
    };

    save({ customFieldsData: updatedData }, callback);
  }

  render() {
    const { fieldsGroups, customFieldsData } = this.props;

    return fieldsGroups.map(fieldGroup => {
      const data = {};

      for (const field of fieldGroup.fields) {
        data[field._id] = customFieldsData[field._id];
      }

      return (
        <GenerateGroup
          key={fieldGroup._id}
          data={data}
          fieldGroup={fieldGroup}
          save={this.saveGroup}
        />
      );
    });
  }
}

GenerateGroups.propTypes = {
  fieldsGroups: PropTypes.array.isRequired,
  customFieldsData: PropTypes.object,
  save: PropTypes.func.isRequired
};

export default GenerateGroups;
