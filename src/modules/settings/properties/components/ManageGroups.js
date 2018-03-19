import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SidebarContent } from 'modules/layout/styles';
import GenerateField from './GenerateField';

const propTypes = {
  fieldsGroups: PropTypes.array.isRequired,
  customFieldsData: PropTypes.object,
  save: PropTypes.func.isRequired
};

class GenerateGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      customFieldsData: props.customFieldsData
    };

    this.toggleEditing = this.toggleEditing.bind(this);
    this.onChange = this.onChange.bind(this);
    this.save = this.save.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
  }

  save() {
    const { customFieldsData } = this.state;
    const { save } = this.props;

    save({ customFieldsData }, error => {
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
    const { customFieldsData } = this.state;

    this.setState({ customFieldsData: { ...customFieldsData, [_id]: value } });
    this.toggleEditing();
  }

  renderGroups() {
    const { fieldsGroups } = this.props;
    const { customFieldsData } = this.state;
    const { Section } = Sidebar;

    return fieldsGroups.map(fieldGroup => {
      if (!fieldGroup.isVisible) return null;

      return (
        <Section key={fieldGroup._id}>
          <Section.Title>{fieldGroup.name}</Section.Title>

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
                  defaultValue={
                    customFieldsData ? customFieldsData[field._id] : ''
                  }
                />
              );
            })}
          </SidebarContent>
        </Section>
      );
    });
  }
}

GenerateGroups.propTypes = propTypes;

export default GenerateGroups;
