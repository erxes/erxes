import Box from 'modules/common/components/Box';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import { Alert } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import { SidebarContent } from '../styles';
import { IFieldGroup } from '../types';
import GenerateField from './GenerateField';

type Props = {
  isDetail: boolean;
  fieldGroup: IFieldGroup;
  loading?: boolean;
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
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading && this.props.data !== nextProps.data) {
      this.setState({ data: nextProps.data });
    }
  }

  save = () => {
    const { data } = this.state;
    const { save } = this.props;

    save(data, error => {
      if (error) {
        return Alert.error(error.message);
      }

      this.cancelEditing();

      return Alert.success('Success');
    });
  };

  cancelEditing = () => {
    this.setState({
      editing: false
    });
  };

  onChange = ({ _id, value }) => {
    const { data } = this.state;

    this.setState({ data: { ...data, [_id]: value }, editing: true });
  };

  renderButtons() {
    if (!this.state.editing) {
      return null;
    }

    return (
      <Sidebar.Footer>
        <Button
          btnStyle="simple"
          uppercase={false}
          onClick={this.cancelEditing}
          icon="times-circle"
        >
          Discard
        </Button>
        <Button
          btnStyle="success"
          uppercase={false}
          onClick={this.save}
          icon="check-circle"
        >
          Save
        </Button>
      </Sidebar.Footer>
    );
  }

  renderContent() {
    const { fieldGroup, isDetail } = this.props;
    const { data } = this.state;
    const { fields } = fieldGroup;

    const isVisibleKey = isDetail ? 'isVisibleInDetail' : 'isVisible';

    if (fields.length === 0) {
      return <EmptyState icon="folder-2" text="Empty" size="small" />;
    }

    if (
      fields.length !== 0 &&
      fields.filter(e => e[isVisibleKey]).length === 0
    ) {
      return (
        <EmptyState
          icon="folder-2"
          text={`${fields.length} property(s) hidden.`}
          size="small"
        />
      );
    }

    return (
      <SidebarContent>
        {fields.map((field, index) => {
          if (!field[isVisibleKey]) {
            return null;
          }

          return (
            <GenerateField
              field={field}
              key={index}
              onValueChange={this.onChange}
              defaultValue={data[field._id] || ''}
            />
          );
        })}
      </SidebarContent>
    );
  }

  render() {
    const { fieldGroup, isDetail } = this.props;
    const isVisibleKey = isDetail ? 'isVisibleInDetail' : 'isVisible';

    if (!fieldGroup[isVisibleKey]) {
      return null;
    }

    return (
      <Box title={fieldGroup.name} name="showCustomFields">
        {this.renderContent()}
        {this.renderButtons()}
      </Box>
    );
  }
}

type GroupsProps = {
  isDetail: boolean;
  fieldsGroups: IFieldGroup[];
  customFieldsData: any;
  loading?: boolean;
  save: (data: { customFieldsData: any }, callback: () => any) => void;
};

class GenerateGroups extends React.Component<GroupsProps> {
  saveGroup = (groupData, callback) => {
    const { customFieldsData, save } = this.props;

    const prevData = {};
    (customFieldsData || []).forEach(cd => (prevData[cd.field] = cd.value));

    const updatedData = {
      ...prevData,
      ...(groupData || {})
    };

    save(
      {
        customFieldsData: Object.keys(updatedData).map(key => ({
          field: key,
          value: updatedData[key]
        }))
      },
      callback
    );
  };

  render() {
    const { loading, fieldsGroups, customFieldsData, isDetail } = this.props;
    const { Section } = Sidebar;

    if (fieldsGroups.length === 0) {
      return (
        <Section>
          <EmptyState icon="folder-2" text="Empty" size="small" />
        </Section>
      );
    }

    return fieldsGroups.map(fieldGroup => {
      const data = {};

      for (const customFieldData of customFieldsData || []) {
        data[customFieldData.field] = customFieldData.value;
      }

      return (
        <GenerateGroup
          isDetail={isDetail}
          key={fieldGroup._id}
          loading={loading}
          data={data}
          fieldGroup={fieldGroup}
          save={this.saveGroup}
        />
      );
    });
  }
}

export default GenerateGroups;
