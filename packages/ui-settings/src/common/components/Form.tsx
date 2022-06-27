import Button from '@erxes/ui/src/components/Button';
import CommonForm from '@erxes/ui/src/components/form/Form';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { ICommonFormProps } from '../types';
import dayjs from 'dayjs';
import { CreatedDate } from '../../styles';

type Props = {
  confirmationUpdate?: boolean;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  generateDoc: (values: any) => any;
  object?: any;
  name?: string;
  renderContent(formProps: IFormProps): any;
  createdAt?: string;
} & ICommonFormProps;

class Form extends React.Component<Props, { isCanceled: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isCanceled: false
    };
  }

  renderFormContent = (formProps: IFormProps) => {
    const {
      renderContent,
      renderButton,
      closeModal,
      confirmationUpdate,
      object,
      name,
      createdAt
    } = this.props;
    const { values, isSubmitted } = formProps;
    const { isCanceled } = this.state;

    const cancel = () => {
      this.setState({ isCanceled: true }, () => {
        closeModal();
      });
    };

    return (
      <>
        {renderContent({ ...formProps, isSaved: isSubmitted || isCanceled })}

        <ModalFooter>
          {createdAt && (
            <CreatedDate>
              <p>Created at</p> {dayjs(createdAt).format('lll')}
            </CreatedDate>
          )}
          <Button
            btnStyle="simple"
            type="button"
            onClick={cancel}
            icon="times-circle"
          >
            Cancel
          </Button>

          {renderButton &&
            renderButton({
              name: name || '',
              values: this.props.generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object,
              confirmationUpdate: object ? confirmationUpdate : false
            })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderFormContent} />;
  }
}

export default Form;
