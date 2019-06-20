import { IStage } from 'modules/boards/types';
import {
  Button,
  ControlLabel,
  Form,
  FormControl
} from 'modules/common/components';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { FormFooter, HeaderContent, HeaderRow } from '../../styles/item';
import { invalidateCache } from '../../utils';

type Props = {
  stage: IStage;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

class AddForm extends React.Component<Props> {
  generateDoc = (values: { stageId?: string; name: string }) => {
    const { stage } = this.props;
    const finalValues = values;

    if (stage) {
      finalValues.stageId = stage._id;
    }

    return {
      stageId: finalValues.stageId,
      ...values
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const callback = () => {
      closeModal();
      invalidateCache();
    };

    return (
      <>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              autoFocus={true}
              required={true}
            />
          </HeaderContent>
        </HeaderRow>

        <FormFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            values: this.generateDoc(values),
            isSubmitted,
            callback
          })}
        </FormFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default AddForm;
