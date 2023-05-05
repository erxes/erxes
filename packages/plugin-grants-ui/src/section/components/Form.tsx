import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { Button, Form as CommonForm, __ } from '@erxes/ui/src';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { SelectActions } from '../../common/section/utils';
type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class Form extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  generateDocs() {
    return {};
  }

  renderContent(props: IFormProps) {
    return (
      <>
        <SelectActions
          label="Select Actions"
          name="actions"
          onSelect={props => console.log(props)}
        />
        <ModalFooter>
          <Button btnStyle="simple">{__('Close')}</Button>
          {this.props?.renderButton({
            text: 'Grant Request',
            values: this.generateDocs(),
            isSubmitted: props.isSubmitted
          })}
        </ModalFooter>
      </>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
