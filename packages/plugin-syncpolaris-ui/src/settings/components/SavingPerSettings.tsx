import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import { Row } from '@erxes/ui-settings/src/styles';
import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
} from '@erxes/ui/src/components';
import { FormColumn, ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { IConfigsMap } from '../types';

type Props = {
  currentKey: string;
  contractTypes: any[];
  attrs: IConfigsMap;
  fieldGroups: IFieldGroup[];
  delete: (currentKey: string) => void;
  configsMap: IConfigsMap;
  setCurrentMap: (currentKey: string, currentMap: IConfigsMap) => void;
  setContractType: (currentKey: string, oldKey: string, title: string, currentMap: IConfigsMap) => void;
  isOpen: boolean;
};

const SavingPerSettings = (props: Props) => {
  const { currentKey, attrs, fieldGroups, configsMap, contractTypes, setCurrentMap, setContractType } = props
  const currentMap = configsMap.values || {};

  const addAttr = () => {
    setCurrentMap(currentKey, { ...currentMap, [`newItem-${Math.random().toString()}`]: { title: '' } })
  }

  const renderInput = (key: string) => {
    const onChangeInput = (value) => {
      setCurrentMap(currentKey, { ...currentMap, [key]: { ...currentMap[key] || {}, value } })
    };

    return (
      <FormControl
        value={currentMap[key]?.value}
        onChange={(e) => onChangeInput((e.target as any).value)}
      />
    );
  };

  const renderFields = (key: string) => {
    const setFieldGroup = (value) => {
      setCurrentMap(currentKey, { ...currentMap, [key]: { ...currentMap[key] || {}, groupId: value } })
    }

    const setFormField = (value) => {
      const currentFields = ((fieldGroups || []).find(
        (fg) => fg._id === currentMap[key]?.groupId
      ) || {}).fields;
      const field = currentFields?.find(cf => cf._id === value);
      let propType: string | undefined = undefined

      if (field?.isDefinedByErxes) {
        propType = field.type;
      }

      setCurrentMap(currentKey, { ...currentMap, [key]: { ...currentMap[key] || {}, fieldId: value, propType } })
    }

    return (
      <>
        <FormGroup>
          <FormControl
            name="fieldGroup"
            componentclass="select"
            options={[
              { value: "", label: "Empty" },
              ...(fieldGroups || []).map((fg) => ({
                value: fg._id,
                label: `${fg.code} - ${fg.name}`,
              })),
            ]}
            value={currentMap[key]?.groupId}
            onChange={(e) => setFieldGroup((e.target as any).value)}
          />

          <FormControl
            name="formField"
            componentclass="select"
            options={[
              { value: "", label: "Empty" },
              ...(
                (
                  (
                    (fieldGroups || []).find(
                      (fg) => fg._id === currentMap[key]?.groupId
                    ) || {}
                  ).fields || []
                ) || []
              ).map((f) => ({
                value: f._id,
                label: `${f.code} - ${f.text}`,
              })),
            ]}
            value={currentMap[key]?.fieldId}
            onChange={(e) => setFormField((e.target as any).value)}
          />
        </FormGroup>
      </>
    );
  };

  const itemDelete = (key) => {
    const tempMap = { ...currentMap };
    delete tempMap[key];
    setCurrentMap(currentKey, { ...tempMap })
  }

  const renderItem = (key: string, label: string, description?: string) => {
    const setType = (value) => {
      setCurrentMap(currentKey, { ...currentMap, [key]: { ...currentMap[key] || {}, type: value } })
    }

    const setKey = (value) => {
      setCurrentMap(currentKey, { ...currentMap, [key]: { ...currentMap[key] || {}, title: value, label: value } })
    }

    const type = currentMap[key]?.type || 'str';
    const isDefault = Object.keys(attrs).includes(key);

    return (
      <FormGroup key={key}>
        <ControlLabel>{label}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <Row>
          <FormColumn maxwidth='10%'>
            <FormControl
              name="fieldGroup"
              componentclass="select"
              options={[
                { value: "", label: "Any" },
                { value: "form", label: "Form Fields" },
              ]}
              value={currentMap[key]?.type}
              onChange={(e) => setType((e.target as any).value)}
            />
          </FormColumn>
          <FormColumn maxwidth='15%'>
            <FormControl
              name="fieldGroup"
              value={isDefault ? key : currentMap[key].title}
              disabled={isDefault}
              onChange={(e) => setKey((e.target as any).value)}
            />
          </FormColumn>
          <FormColumn>
            {
              type === 'form' ?
                (renderFields(key)) :
                (renderInput(key))
            }
          </FormColumn>
          {!isDefault && <Button btnStyle="link" icon="times-circle" onClick={itemDelete.bind(this, key)} />}
        </Row>
      </FormGroup>
    );
  }

  const onChangeContractType = (value) => {
    const contractType = contractTypes.find(ct => ct._id === value)
    setContractType(value, currentKey, contractType?.name, { ...currentMap })
  }

  const onDelete = () => {
    props.delete(currentKey)
  }

  return (
    <CollapseContent
      title={configsMap.title}
      beforeTitle={<Icon icon="settings" />}
      transparent={true}
      open={props.isOpen}
    >
      <FormGroup>
        <ControlLabel>{'Savings Contract Type'}</ControlLabel>

        <FormControl
          name="title"
          componentclass="select"
          options={[
            { value: '', label: 'empty' },
            ...props.contractTypes.map(ct => ({ value: ct._id, label: ct.name }))
          ]
          }
          value={currentKey}
          onChange={(e) => onChangeContractType((e.target as any).value)}
        />
      </FormGroup>

      {
        Array.from(new Set(Object.keys({ ...attrs, ...currentMap }))).map(key => {
          const data = { ...currentMap[key] || {}, ...attrs[key] || {} }
          return renderItem(key, data?.label || key, data?.description);
        })
      }
      <ModalFooter>
        <Button
          onClick={addAttr}
          icon="add"
          uppercase={false}
        >
          Add field
        </Button>

        <Button
          btnStyle="danger"
          icon="cancel-1"
          onClick={onDelete}
          uppercase={false}
        >
          Delete
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
}

export default SavingPerSettings;
