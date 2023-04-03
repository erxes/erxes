import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { IField } from '@erxes/ui/src/types';
import { default as _loadash } from 'lodash';
import React from 'react';
import { Padding } from '../../../styles';
import { DetailPopOver } from '../../common/utils';
import IndicatorAssessmentHistory from '../containers/IndicatorAssessmentHistory';

type Props = {
  fields: IField[];
  submittedFields: any;
  withDescription: boolean;
  submitForm: (doc: any) => void;
  closeModal: () => void;
  onlyPreview?: boolean;
  indicatorId: string;
};

type State = {
  submissions: { [key: string]: { value: string; description: string } };
};

class IndicatorForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      submissions: {}
    };
  }

  componentDidMount() {
    if (
      JSON.stringify(this.props.submittedFields) !==
      JSON.stringify(this.state.submissions)
    ) {
      this.setState({ submissions: this.props.submittedFields });
    }
  }

  renderDescriptionField(value, key: string) {
    const { withDescription } = this.props;
    if (!withDescription) {
      return;
    }

    const onChangeDescription = e => {
      const { submissions } = this.state;
      const { value } = e.currentTarget as HTMLInputElement;

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
      closeModal,
      onlyPreview,
      indicatorId
    } = this.props;

    const { submissions } = this.state;

    const handleChange = field => {
      this.setState(prev => ({
        submissions: {
          ...prev.submissions,
          [field._id]: { ...prev.submissions[field._id], value: field.value }
        }
      }));
    };

    const setHistory = submissions => {
      this.setState({ submissions });
    };

    const submitForm = () => {
      const { submitForm } = this.props;
      const { submissions } = this.state;
      submitForm({
        formSubmissions: submissions
      });
    };

    return (
      <>
        <IndicatorAssessmentHistory
          indicatorId={indicatorId}
          setHistory={setHistory}
        />
        <Padding horizontal>
          {(fields || []).map(field => (
            <FormWrapper key={field._id}>
              <FormColumn>
                <GenerateField
                  isEditing={false}
                  key={field._id}
                  field={field}
                  defaultValue={submissions[field._id]?.value}
                  onValueChange={handleChange}
                  isPreview={true}
                />
              </FormColumn>
              {this.renderDescriptionField(
                submissions[field._id]?.description || '',
                field._id
              )}
            </FormWrapper>
          ))}
        </Padding>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Cancel')}
          </Button>
          {_loadash.isEmpty(submittedFields) && !onlyPreview && (
            <Button btnStyle="success" onClick={submitForm}>
              {__('Save')}
            </Button>
          )}
        </ModalFooter>
      </>
    );
  }
}

export default IndicatorForm;
