import { Divider, SidebarContent } from '../styles';
import { IField, ILocationOption } from '@erxes/ui/src/types';
import { IFieldGroup, LogicParams } from '../types';

import { Alert } from '@erxes/ui/src/utils';
import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import GenerateField from './GenerateField';
import Icon from '@erxes/ui/src/components/Icon';
import { ModalTrigger } from '@erxes/ui/src';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Tip from '@erxes/ui/src/components/Tip';
import { checkLogic } from '../utils';

declare const navigator: any;

type Props = {
  isDetail: boolean;
  customFieldsData: any;
  fieldGroup: IFieldGroup;
  fieldsGroups: IFieldGroup[];
  fieldsCombined: IField[];
  loading?: boolean;
  object?: any;
  data: any;
  save: (data: { customFieldsData: any }, callback: () => any) => void;
  saveGroup: (
    data: any,
    callback: (error: Error) => void,
    extraValues?: any
  ) => void;
};

type State = {
  editing: boolean;
  data: any;
  extraValues?: any;
  currentLocation: ILocationOption;
};

class GenerateGroup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editing: false,
      data: JSON.parse(JSON.stringify(props.data)),
      currentLocation: { lat: 0, lng: 0 }
    };
  }

  async componentDidMount() {
    if (this.props.fieldGroup.fields.findIndex(e => e.type === 'map') === -1) {
      return;
    }

    const onSuccess = (position: { coords: any }) => {
      const coordinates = position.coords;
      this.setState({
        currentLocation: {
          lat: coordinates.latitude,
          lng: coordinates.longitude
        }
      });
    };

    const onError = (err: { code: any; message: any }) => {
      return Alert.error(`${err.code}): ${err.message}`);
    };

    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(onSuccess);
        } else if (result.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading && this.props.data !== nextProps.data) {
      this.setState({ data: nextProps.data });
    }
  }

  save = () => {
    const { data, extraValues } = this.state;
    const { saveGroup } = this.props;

    saveGroup(
      data,
      error => {
        if (error) {
          return Alert.error(error.message);
        }

        this.cancelEditing();

        return Alert.success('Success');
      },
      extraValues
    );
  };

  cancelEditing = () => {
    this.setState({
      data: JSON.parse(JSON.stringify(this.props.data)),
      editing: false
    });
  };

  onChange = (
    index: number,
    { _id, value, extraValue }: { _id: string; value: any; extraValue?: string }
  ) => {
    const { fields, isMultiple } = this.props.fieldGroup;
    const fieldGroupId = this.props.fieldGroup._id;

    const { data, extraValues = {} } = this.state;

    if (isMultiple) {
      if (!data[fieldGroupId]) {
        data[fieldGroupId] = [];
      }

      if (!data[fieldGroupId][index]) {
        data[fieldGroupId][index] = {
          [_id]: value
        };
      } else {
        data[fieldGroupId][index][_id] = value;
      }
    } else {
      data[_id] = value;
    }

    // check nested logics and clear field value
    for (const f of fields) {
      const logics = f.logics || [];

      if (!logics.length) {
        continue;
      }

      if (logics.findIndex(l => l.fieldId && l.fieldId.includes(_id)) === -1) {
        continue;
      }

      if (isMultiple) {
        delete data[fieldGroupId][index][_id];
      } else {
        delete data[f._id];
      }
    }

    const updatedState: any = { data, editing: true };

    if (extraValue) {
      extraValues[_id] = extraValue;
      updatedState.extraValues = extraValues;
    }

    this.setState(updatedState);
  };

  onAddGroupInput = () => {
    const { fieldGroup } = this.props;
    const { data } = this.state;

    data[fieldGroup._id].push({});

    this.setState({ data, editing: true });
  };

  onRemoveGroupInput = (index: number) => {
    const { fieldGroup } = this.props;
    const { data } = this.state;

    if (data[fieldGroup._id].length === 1) {
      data[fieldGroup._id] = [];
    } else {
      data[fieldGroup._id].splice(index, 1);
    }

    this.setState({ data, editing: true });
  };

  renderButtons() {
    if (!this.state.editing) {
      return null;
    }

    return (
      <Sidebar.Footer>
        <Button
          btnStyle="simple"
          onClick={this.cancelEditing}
          icon="times-circle"
        >
          Discard
        </Button>
        <Button btnStyle="success" onClick={this.save} icon="check-circle">
          Save
        </Button>
      </Sidebar.Footer>
    );
  }

  renderContent() {
    const { fieldGroup, isDetail, object = {} } = this.props;
    const { data } = this.state;
    const { fields, isMultiple } = fieldGroup;

    const groupData = data[fieldGroup._id] || [];
    const isVisibleKey = isDetail ? 'isVisibleInDetail' : 'isVisible';

    if (!fields || fields.length === 0) {
      return null;
    }

    if (fields.filter(e => e[isVisibleKey]).length === 0) {
      return (
        <EmptyState
          icon="folder-2"
          text={`${fields.length} property(s) hidden.`}
          size="small"
        />
      );
    }

    const numberToIterate = isMultiple
      ? groupData && groupData.length > 0
        ? groupData.length
        : 1
      : 1;

    return (
      <SidebarContent>
        {Array(numberToIterate)
          .fill(0)
          .map((_, groupDataIndex) => {
            const groupDataValue = groupData[groupDataIndex] || {};

            const fieldRenders = fields.map((field, index) => {
              if (!field[isVisibleKey]) {
                return null;
              }

              if (field.logics && field.logics.length > 0) {
                const logics: LogicParams[] = field.logics.map(logic => {
                  let { fieldId = '' } = logic;

                  if (fieldId.includes('customFieldsData')) {
                    fieldId = fieldId.split('.')[1];
                    return {
                      fieldId,
                      operator: logic.logicOperator,
                      validation: fields.find(e => e._id === fieldId)
                        ?.validation,
                      logicValue: logic.logicValue,
                      fieldValue: isMultiple
                        ? groupDataValue[fieldId]
                        : data[fieldId],
                      type: field.type
                    };
                  }

                  return {
                    fieldId,
                    operator: logic.logicOperator,
                    logicValue: logic.logicValue,
                    fieldValue: object[logic.fieldId || ''],
                    validation: fields.find(e => e._id === fieldId)?.validation,
                    type: field.type
                  };
                });

                const isLogicsFulfilled = checkLogic(logics);

                if (field.logicAction && field.logicAction === 'show') {
                  if (!isLogicsFulfilled) {
                    return null;
                  }
                }

                if (field.logicAction && field.logicAction === 'hide') {
                  if (isLogicsFulfilled) {
                    return null;
                  }
                }
              }

              return (
                <GenerateField
                  field={field}
                  key={index}
                  onValueChange={val => this.onChange(groupDataIndex, val)}
                  defaultValue={
                    isMultiple
                      ? groupDataValue[field._id] || ''
                      : data[field._id] || ''
                  }
                  currentLocation={this.state.currentLocation}
                  isEditing={this.state.editing}
                />
              );
            });

            return (
              <div key={'group' + groupDataIndex}>
                {fieldRenders}
                {isMultiple && (
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      size="small"
                      btnStyle="danger"
                      icon="trash"
                      onClick={() => this.onRemoveGroupInput(groupDataIndex)}
                    />
                  </div>
                )}
                {groupDataIndex !== numberToIterate - 1 && <Divider />}
              </div>
            );
          })}
      </SidebarContent>
    );
  }

  renderChildGroups() {
    const {
      fieldGroup,
      fieldsGroups,
      customFieldsData = [],
      isDetail
    } = this.props;

    const childGroups = fieldsGroups.filter(
      gro => gro.parentId === fieldGroup._id
    );

    const allFields = childGroups.flatMap(group => {
      return group.fields;
    });

    const saveGroup = (groupData, callback) => {
      const { save } = this.props;
      const { extraValues } = this.state;

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
            value: updatedData[key],
            extraValue: !!extraValues?.length ? extraValues[key] : undefined
          }))
        },
        callback
      );
    };

    return childGroups.map(childFieldGroup => {
      const data = {};

      for (const customFieldData of customFieldsData || []) {
        data[customFieldData.field] = customFieldData.value;
      }

      if (childFieldGroup.logics && childFieldGroup.logics.length > 0) {
        const logics: LogicParams[] = childFieldGroup.logics.map(logic => {
          let { fieldId = '' } = logic;

          if (fieldId.includes('customFieldsData')) {
            fieldId = fieldId.split('.')[1];
            return {
              fieldId,
              operator: logic.logicOperator,
              validation: allFields.find(e => e._id === fieldId)?.validation,
              logicValue: logic.logicValue,
              fieldValue: data[fieldId]
            };
          }

          const object = this.props.object || {};

          return {
            fieldId,
            operator: logic.logicOperator,
            logicValue: logic.logicValue,
            fieldValue: object[logic.fieldId || ''],
            validation: allFields.find(e => e._id === fieldId)?.validation
          };
        });

        const isLogicsFulfilled = checkLogic(logics);

        if (fieldGroup.logicAction && fieldGroup.logicAction === 'show') {
          if (!isLogicsFulfilled) {
            return null;
          }
        }

        if (fieldGroup.logicAction && fieldGroup.logicAction === 'hide') {
          if (isLogicsFulfilled) {
            return null;
          }
        }
      }

      return (
        <GenerateGroup
          isDetail={isDetail}
          key={childFieldGroup._id}
          loading={this.props.loading}
          data={data}
          fieldGroup={childFieldGroup}
          fieldsGroups={fieldsGroups}
          fieldsCombined={allFields}
          customFieldsData={customFieldsData}
          save={this.props.save}
          saveGroup={saveGroup}
          object={this.props.object}
        />
      );
    });
  }

  modalContent = (fieldGroup: IFieldGroup) => {
    let extraButtons = <></>;
    if (fieldGroup.isMultiple) {
      extraButtons = (
        <Tip placement="top" text="Add Group Input">
          <button onClick={this.onAddGroupInput}>
            <Icon icon="plus-circle" />
          </button>
        </Tip>
      );
    }
    return (
      <Box
        extraButtons={extraButtons}
        title={fieldGroup.name}
        name="showCustomFields"
        isOpen={true}
      >
        {this.renderContent()}
        {this.renderButtons()}
        {this.renderChildGroups()}
      </Box>
    );
  };

  render() {
    const { fieldGroup, isDetail } = this.props;
    const isVisibleKey = isDetail ? 'isVisibleInDetail' : 'isVisible';
    let extraButtons = <></>;
    const visibleField = fieldGroup.fields.find(el => el.isVisible === true);

    if (!visibleField) {
      return null;
    }

    if (!fieldGroup[isVisibleKey]) {
      return null;
    }

    if (fieldGroup.fields.length === 0) {
      return null;
    }

    if (fieldGroup.isMultiple) {
      extraButtons = (
        <>
          {
            <ModalTrigger
              title={'Edit'}
              trigger={
                <Icon icon="expand-arrows-alt" style={{ cursor: 'pointer' }} />
              }
              size="xl"
              content={() => this.modalContent(fieldGroup)}
            />
          }
          <Tip placement="top" text="Add Group Input">
            <button onClick={this.onAddGroupInput}>
              <Icon icon="plus-circle" />
            </button>
          </Tip>
        </>
      );
    }
    if (!fieldGroup.isMultiple) {
      extraButtons = (
        <ModalTrigger
          title={'Edit'}
          trigger={
            <Icon icon="expand-arrows-alt" style={{ cursor: 'pointer' }} />
          }
          size="xl"
          content={() => this.modalContent(fieldGroup)}
        />
      );
    }

    return (
      <Box
        extraButtons={extraButtons}
        title={fieldGroup.name}
        name="showCustomFields"
        isOpen={fieldGroup.alwaysOpen}
      >
        {this.renderContent()}
        {this.renderButtons()}
        {this.renderChildGroups()}
      </Box>
    );
  }
}

type GroupsProps = {
  isDetail: boolean;
  fieldsGroups: IFieldGroup[];
  customFieldsData: any;
  loading?: boolean;
  object?: any;
  save: (data: { customFieldsData: any }, callback: () => any) => void;
};

class GenerateGroups extends React.Component<GroupsProps> {
  saveGroup = (groupData, callback, extraValues?) => {
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
          value: updatedData[key],
          extraValue:
            extraValues && extraValues[key] ? extraValues[key] : undefined
        }))
      },
      callback
    );
  };

  render() {
    const {
      loading,
      fieldsGroups = [],
      customFieldsData,
      isDetail
    } = this.props;

    const groups = fieldsGroups.filter(gro => !gro.parentId);
    const groupsWithParents = fieldsGroups.filter(gro => !!gro.parentId);

    if (!groups || groups.length === 0) {
      return null;
    }

    const allFields = groups.flatMap(group => {
      return group.fields;
    });

    return groups.map(fieldGroup => {
      const data = {};

      for (const customFieldData of customFieldsData || []) {
        data[customFieldData.field] = customFieldData.value;
      }

      if (fieldGroup.logics && fieldGroup.logics.length > 0) {
        const logics: LogicParams[] = fieldGroup.logics.map(logic => {
          let { fieldId = '' } = logic;

          if (fieldId.includes('customFieldsData')) {
            fieldId = fieldId.split('.')[1];
            return {
              fieldId,
              operator: logic.logicOperator,
              validation: allFields.find(e => e._id === fieldId)?.validation,
              logicValue: logic.logicValue,
              fieldValue: data[fieldId]
            };
          }

          return {
            fieldId,
            operator: logic.logicOperator,
            logicValue: logic.logicValue,
            fieldValue: this.props.object[logic.fieldId || ''],
            validation: allFields.find(e => e._id === fieldId)?.validation
          };
        });

        const isLogicsFulfilled = checkLogic(logics);

        if (fieldGroup.logicAction && fieldGroup.logicAction === 'show') {
          if (!isLogicsFulfilled) {
            return null;
          }
        }

        if (fieldGroup.logicAction && fieldGroup.logicAction === 'hide') {
          if (isLogicsFulfilled) {
            return null;
          }
        }
      }

      return (
        <GenerateGroup
          isDetail={isDetail}
          key={fieldGroup._id}
          loading={loading}
          data={data}
          customFieldsData={customFieldsData}
          fieldGroup={fieldGroup}
          fieldsGroups={groupsWithParents}
          fieldsCombined={allFields}
          object={this.props.object}
          saveGroup={this.saveGroup}
          save={this.props.save}
        />
      );
    });
  }
}

export default GenerateGroups;
