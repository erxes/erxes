import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { Padding } from '../../../styles';
import _loadash from 'lodash';

type Props = {
  fields: IField[];
  submittedFields: any;
  customScoreField: any;
  submitForm: (doc: any) => void;
  closeModal: () => void;
};

type State = {
  submissions: any;
  customScore: number;
};

class IndicatorForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      submissions: {},
      customScore: 0
    };

    this.submitForm = this.submitForm.bind(this);
  }

  submitForm() {
    const { submitForm } = this.props;
    const { submissions, customScore } = this.state;
    submitForm({
      formSubmissions: submissions,
      customScore
    });
  }

  render() {
    const {
      fields,
      submittedFields,
      customScoreField,
      closeModal
    } = this.props;

    const handleChange = field => {
      const { submissions } = this.state;

      submissions[field._id] = field.value;

      this.setState({ submissions });
    };

    const handleChangeCustomScore = e => {
      const { value } = e.currentTarget as HTMLInputElement;
      this.setState({ customScore: Number(value) });
    };

    return (
      <>
        <Padding horizontal>
          {(fields || []).map(field => (
            <GenerateField
              isEditing={true}
              key={field._id}
              field={field}
              defaultValue={submittedFields[field._id]}
              onValueChange={handleChange}
              isPreview={true}
            />
          ))}
          {customScoreField && (
            <FormGroup>
              <ControlLabel>{customScoreField.label}</ControlLabel>
              <FormControl
                name="customScore"
                type="number"
                onChange={handleChangeCustomScore}
                value={customScoreField.value}
              />
            </FormGroup>
          )}
        </Padding>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Cancel')}
          </Button>
          {_loadash.isEmpty(submittedFields) && (
            <Button btnStyle="success" onClick={this.submitForm}>
              {__('Save')}
            </Button>
          )}
        </ModalFooter>
      </>
    );
  }
}

export default IndicatorForm;
