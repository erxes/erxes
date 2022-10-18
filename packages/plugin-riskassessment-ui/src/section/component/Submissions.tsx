import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import { Button } from '@erxes/ui/src';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import __ from 'lodash';
import React from 'react';

type Props = {
  fields: any;
  submissions: any;
  formId: string;
  formSubmissionsSave: (doc: any) => any;
  closeModal: () => void;
  isSubmitted?: boolean;
};

type State = {
  submissions: object;
};
class SubmissionsComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      submissions: this.props.submissions || {}
    };

    this.handleSumbmissionForm = this.handleSumbmissionForm.bind(this);
  }

  handleSumbmissionForm() {
    const { formSubmissionsSave, formId } = this.props;

    const { submissions } = this.state;

    formSubmissionsSave({
      formSubmissions: submissions,
      formId
    });
  }

  renderForm() {
    const { fields } = this.props;
    const { submissions } = this.state;

    const handleChange = field => {
      submissions[field._id] = field.value;
      this.setState({ submissions });
    };

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

  render() {
    const { closeModal, isSubmitted } = this.props;

    return (
      <div>
        {this.renderForm()}
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
      </div>
    );
  }
}

export default SubmissionsComponent;
