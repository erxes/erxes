import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import { Row } from '@erxes/ui-settings/src/styles';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components';
import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import { FormColumn } from '@erxes/ui/src/styles/main';
import React from 'react';

type Props = {
  fieldGroups: IFieldGroup[]
  item: any
  editExtra: (values: any) => void;
};

const PullCustomerExtra = (props: Props) => {
  const { item, editExtra, fieldGroups } = props;

  const renderInput = (key: string, code: string) => {
    const onChangeInput = (value) => {
      editExtra({ ...item.extra, [key]: { ...item.extra[key] || {}, [code]: value } })
    };

    return (
      <FormControl
        value={item.extra[key] && item.extra[key][code]}
        onChange={(e) => onChangeInput((e.target as any).value)}
      />
    );
  };

  const renderFields = (key: string) => {
    const setFieldGroup = (value) => {
      editExtra({ ...item.extra, [key]: { ...item.extra[key] || {}, groupId: value } })
    }

    const setFormField = (value) => {
      const currentFields = ((fieldGroups || []).find(
        (fg) => fg._id === item.extra[key]?.groupId
      ) || {}).fields;
      const field = currentFields?.find(cf => cf._id === value);
      let propType: string | undefined = undefined;

      if (field?.isDefinedByErxes) {
        propType = field.type;
      }

      editExtra({ ...item.extra, [key]: { ...item.extra[key] || {}, fieldId: value, propType } })
    }

    return (
      <>
        <FormColumn maxwidth='30%'>
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
            value={item.extra[key]?.groupId}
            onChange={(e) => setFieldGroup((e.target as any).value)}
          />
        </FormColumn>
        <FormColumn maxwidth='30%'>
          <FormControl
            name="formField"
            componentclass="select"
            options={[
              { value: "", label: "Empty" },
              ...(
                (
                  (
                    (fieldGroups || []).find(
                      (fg) => fg._id === item.extra[key]?.groupId
                    ) || {}
                  ).fields || []
                ) || []
              ).map((f) => ({
                value: f._id,
                label: `${f.code} - ${f.text}`,
              })),
            ]}
            value={item.extra[key]?.fieldId}
            onChange={(e) => setFormField((e.target as any).value)}
          />
        </FormColumn>
      </>
    );
  };

  const onRemoveExtra = (key) => {
    const tempExtra = { ...item.extra };
    delete tempExtra[key]
    editExtra({ ...tempExtra })
  }

  const renderPerExtra = (key) => {
    return <Row key={key}>
      <FormColumn maxwidth='5%'></FormColumn>
      <FormColumn maxwidth='35%'>
        {renderInput(key, 'respKey')}
      </FormColumn>
      {renderFields(key)}
      {/* <FormColumn maxwidth='10%'>
        {renderInput(key, 'expireDay')}
      </FormColumn> */}
      <FormColumn maxwidth='5%'>
        <ActionButtons>
          <Button btnStyle="link" icon="times-circle" onClick={onRemoveExtra.bind(this, key)} />
        </ActionButtons>
      </FormColumn>
    </Row>
  }

  return (
    <FormGroup>
      <Row>
        <FormColumn maxwidth='5%'></FormColumn>
        <FormColumn maxwidth='35%'>
          <ControlLabel>Response key</ControlLabel>
        </FormColumn>
        <FormColumn maxwidth='30%'>
          <ControlLabel>Field Gruop</ControlLabel>
        </FormColumn>
        <FormColumn maxwidth='30%'>
          <ControlLabel>Field</ControlLabel>
        </FormColumn>
        {/* <FormColumn maxwidth='10%'>
              <ControlLabel>Expire day</ControlLabel>
            </FormColumn> */}
        <FormColumn maxwidth='5%'>
          <ControlLabel>Actions</ControlLabel>
        </FormColumn>
      </Row>
      {Object.keys(item.extra).map(key => renderPerExtra(key))}
    </FormGroup>
  )
}

export default PullCustomerExtra;