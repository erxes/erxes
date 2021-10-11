import React, { useState } from 'react';
import { FormControl, FormGroup } from 'modules/common/components/form';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import Form from 'modules/common/components/form/Form';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IStructure } from '../../types';
import SelectTeamMembers from '../../containers/SelectTeamMembers';
import Box from 'modules/common/components/Box';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  structure?: IStructure;
};

export default function StructureForm(props: Props) {
  const { structure, renderButton } = props;
  const object = structure || ({} as IStructure);

  const [supervisorId, setSupervisorId] = useState(object.supervisorId || '');

  const generateDoc = values => {
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      supervisorId,
      ...finalValues
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <div style={{ padding: '20px' }}>
        <FormGroup>
          <ControlLabel required={true}>{__('Title')}</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            autoFocus={true}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
            componentClass="textarea"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Code')}</ControlLabel>
          <FormControl {...formProps} name="code" defaultValue={object.code} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Supervisor')}</ControlLabel>

          <SelectTeamMembers
            label="Choose supervisor"
            name="supervisorId"
            multi={false}
            initialValue={supervisorId}
            onSelect={value => setSupervisorId(value.toString())}
          />
        </FormGroup>
        <ModalFooter>
          {renderButton({
            name: values.title,
            values: generateDoc(values),
            isSubmitted,
            object
          })}
        </ModalFooter>
      </div>
    );
  };

  return (
    <Box isOpen={true} title={__('Structure')} name="showStructure">
      <Form renderContent={renderContent} />
    </Box>
  );
}
