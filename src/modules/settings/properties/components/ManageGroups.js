import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'modules/common/utils';
import { SidebarContent } from '../styles';
import GenerateField from './GenerateField';
import { BaseSection } from 'modules/customers/components';

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

    return fieldsGroups.map(fieldGroup => {
      if (!fieldGroup.isVisible) return null;

      const content = (
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
      );

      return (
        <BaseSection
          key={fieldGroup._id}
          title={fieldGroup.name}
          content={content}
          name="showManageGroups"
        />
      );
    });
  }
}

GenerateGroups.propTypes = propTypes;

export default GenerateGroups;
