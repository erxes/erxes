import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';

type Props = {
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  history: any;
};

class PageForm extends React.Component<Props> {
  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const renderFields = (title: string, name: string, required?: boolean) => {
      return (
        <FormGroup>
          <ControlLabel required={true}>{title}</ControlLabel>

          <FormControl
            {...formProps}
            name={name}
            required={required || false}
            autoFocus={true}
          />
        </FormGroup>
      );
    };

    return (
      <>
        {renderFields('Company name', 'companyName')}

        {renderFields('Name', 'name', true)}

        {renderFields('Slug', 'slug', true)}

        {renderFields('Event title', 'eventTitle', true)}

        {renderFields('Location', 'location')}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="cancel-1"
            uppercase={false}
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            values,
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default PageForm;
