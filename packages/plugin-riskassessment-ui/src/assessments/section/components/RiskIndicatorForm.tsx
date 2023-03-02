import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { Padding } from '../../../styles';
import _loadash from 'lodash';
import { DetailPopOver } from '../../common/utils';

type Props = {
  fields: IField[];
  submittedFields: any;
  customScoreField: any;
  withDescription: boolean;
  submitForm: (doc: any) => void;
  closeModal: () => void;
  onlyPreview?: boolean;
};

type State = {
  submissions: { [key: string]: { value: string; description: string } };
  customScore: { value: number; description: string };
};

class IndicatorForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      submissions: {},
      customScore: {
        value: 0,
        description: ''
      }
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

  renderDescriptionField(value, key: string) {
    const { withDescription } = this.props;
    if (!withDescription) {
      return;
    }

    const onChangeDescription = e => {
      const { submissions } = this.state;
      const { value } = e.currentTarget as HTMLInputElement;

      if (key === 'customScore') {
        return this.setState(prev => ({
          customScore: { ...prev.customScore, description: value }
        }));
      }

      submissions[key] = {
        ...submissions[key],
        description: value
      };

      this.setState({ submissions });
    };

    return (
      <DetailPopOver title="" withoutPopoverTitle icon="comment-alt-edit">
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            name="description"
            componentClass="textarea"
            placeholder="Type some description"
            onChange={onChangeDescription}
            value={value}
          />
        </FormGroup>
      </DetailPopOver>
    );
  }

  render() {
    const {
      fields,
      submittedFields,
      customScoreField,
      closeModal,
      onlyPreview
    } = this.props;

    const handleChange = field => {
      const { submissions } = this.state;

      submissions[field._id] = {
        ...submissions[field._id],
        value: field.value
      };

      this.setState({ submissions });
    };

    const handleChangeCustomScore = e => {
      const { value } = e.currentTarget as HTMLInputElement;
      this.setState(prev => ({
        customScore: { ...prev.customScore, value: Number(value) }
      }));
    };

    return (
      <>
        <Padding horizontal>
          {(fields || []).map(field => (
            <FormWrapper key={field._id}>
              <FormColumn>
                <GenerateField
                  isEditing={true}
                  key={field._id}
                  field={field}
                  defaultValue={submittedFields[field._id]?.value}
                  onValueChange={handleChange}
                  isPreview={true}
                />
              </FormColumn>
              {this.renderDescriptionField(
                submittedFields[field._id]?.description,
                field._id
              )}
            </FormWrapper>
          ))}
          {customScoreField && (
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{customScoreField.label}</ControlLabel>
                  <FormControl
                    name="customScore"
                    type="number"
                    onChange={handleChangeCustomScore}
                    value={customScoreField.value}
                  />
                </FormGroup>
              </FormColumn>
              {this.renderDescriptionField(
                customScoreField.description,
                'customScore'
              )}
            </FormWrapper>
          )}
        </Padding>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Cancel')}
          </Button>
          {_loadash.isEmpty(submittedFields) && !onlyPreview && (
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
