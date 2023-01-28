import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Step,
  Steps
} from '@erxes/ui/src';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import __ from 'lodash';
import React from 'react';
import { FormContainer, Padding } from '../../styles';
import { DetailPopOver } from '../../assessments/common/utils';
import { PopoverList } from '@erxes/ui/src/components/filterableList/styles';

type Props = {
  fields: any[];
  indicators: any[];
  indicatorId: string;
  indicator: any;
  submissions: any;
  // formId: string;
  formSubmissionsSave: (doc: any) => any;
  closeModal: () => void;
  isSubmitted?: boolean;
};

type State = {
  submissions: any;
  indicatorId: string;
  customScore: number;
};
class SubmissionsComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      submissions: props.submissions || {},
      indicatorId: props.indicatorId || '',
      customScore: 0
    };

    this.handleSumbmissionForm = this.handleSumbmissionForm.bind(this);
  }

  handleSumbmissionForm() {
    const { formSubmissionsSave } = this.props;
    console.log(this.props);

    const { submissions, indicatorId, customScore } = this.state;

    formSubmissionsSave({
      formSubmissions: submissions,
      indicatorId,
      customScore
    });
  }

  renderForm(fields) {
    const { submissions } = this.state;

    console.log({ submissions });
    const handleChange = field => {
      submissions[field._id] = field.value;

      this.setState({ submissions });
    };

    console.log(fields);

    return fields.map(field => (
      <GenerateField
        isEditing={true}
        defaultValue={submissions[field._id]}
        key={field._id}
        field={field}
        onValueChange={handleChange}
        isPreview={true}
      />
    ));
  }

  renderSelector() {
    const { indicators, indicatorId } = this.props;
    return (
      <FormContainer justify="end">
        <DetailPopOver
          title="Indicators"
          icon="downarrow-2"
          withoutPopoverTitle
        >
          <PopoverList>
            {(indicators || []).map(indicator => (
              <li key={indicator._id}>
                {indicator._id === indicatorId && <Icon icon="check-1" />}
                {indicator.name}
              </li>
            ))}
          </PopoverList>
        </DetailPopOver>
      </FormContainer>
    );
  }

  renderCustomScoreField() {
    const { indicator } = this.props;

    if (!indicator?.customScoreField) {
      return;
    }

    const { customScoreField } = indicator;

    const handleChange = e => {
      const { value } = e.currentTarget as HTMLInputElement;
      this.setState({ customScore: parseInt(value) });
    };

    return (
      <FormGroup>
        <ControlLabel>{customScoreField.label || '-'}</ControlLabel>
        <FormControl type="number" name="customScore" onChange={handleChange} />
      </FormGroup>
    );
  }

  render() {
    const {
      fields,
      indicators,
      isSubmitted,
      closeModal,
      indicator
    } = this.props;
    const { indicatorId } = this.state;

    return (
      <>
        {this.renderSelector()}
        <Padding horizontal vertical>
          {this.renderForm(fields)}
          {indicator?.customScoreField && (
            <FormGroup>
              <ControlLabel>{}</ControlLabel>
            </FormGroup>
          )}
        </Padding>
        {!isSubmitted && (
          <ModalFooter>
            <Button btnStyle="simple" onClick={closeModal}>
              Cancel
            </Button>
            <Button btnStyle="success" onClick={this.handleSumbmissionForm}>
              Submit
            </Button>
          </ModalFooter>
        )}
      </>
    );
  }
}

export default SubmissionsComponent;
