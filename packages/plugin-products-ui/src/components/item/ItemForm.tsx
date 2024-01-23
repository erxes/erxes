import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import { IItem } from '../.././types';

type Props = {
  item?: IItem;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  history: any;
};

type State = {
  code: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item || ({} as IItem);
    const { code } = item;

    this.state = {
      code: code || '',
    };
  }

  generateDoc = (values: { _id?: string; code: string }) => {
    const { item } = this.props;
    const finalValues = values;
    const { code } = this.state;

    if (item) {
      finalValues._id = item._id;
    }

    return {
      ...finalValues,
      code,
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, item } = this.props;
    const { values, isSubmitted } = formProps;
    const object = item || ({} as IItem);

    const { code } = this.state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                defaultValue={object.name}
                autoFocus={true}
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Code</ControlLabel>
              <p>
                Depending on your business type, you may type in a barcode or
                any other UPC (Universal Product Code). If you don't use UPC,
                type in any numeric value to differentiate your products. With
                pattern
              </p>
              <FormControl
                {...formProps}
                name="code"
                value={code}
                required={true}
                onChange={(e: any) => {
                  this.setState({
                    code: e.target.value.replace(/\*/g, ''),
                  });
                }}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                componentClass="textarea"
                defaultValue={object.description}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'item',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: item,
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
