import { Button } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import * as React from 'react';
import { SidebarContent } from '../styles';
import { IFieldGroup } from '../types';
import GenerateField from './GenerateField';

type Props = {
  fieldGroup: IFieldGroup;
  data: any;
  save: (data: any, callback: (error: Error) => void) => void;
};

type State = {
  editing: boolean;
  data: any;
};

class GenerateGroup extends React.Component<Props, State> {
  constructor(props: Props) {
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

type GroupsProps = {
  fieldsGroups: IFieldGroup[];
  customFieldsData: any;
  save: (data: { customFieldsData: any }, callback: () => any) => void;
};

class GenerateGroups extends React.Component<GroupsProps> {
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

export default GenerateGroups;
