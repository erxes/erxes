import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import CommonForm from '@erxes/ui/src/components/form/Form';
import React from 'react';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import SelectKbCategory from '../../common/SelectKBCategories';

type Props = {
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  safetyTip?: any;
};

type State = {
  obj: any;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      obj: props?.safetyTip || {}
    };
  }

  generateDoc = values => {
    return { ...this.state.obj, ...values };
  };

  renderForm = (formProps: IFormProps) => {
    const { renderButton, closeModal, safetyTip } = this.props;
    const { obj } = this.state;
    const { isSubmitted, values } = formProps;

    const handleSelect = (value, name) => {
      this.setState({
        obj: { ...obj, [name]: value }
      });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            required
            defaultValue={obj?.name}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            required
            name="description"
            defaultValue={obj?.description}
            componentClass="textarea"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Knowledgebase category')}</ControlLabel>
          <SelectKbCategory
            label="Knowledgebase category"
            name="kbCategoryId"
            initialValue={obj?.kbCategoryId || ''}
            onSelect={handleSelect}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Branches')}</ControlLabel>
          <SelectBranches
            name="branchIds"
            label="Branches"
            initialValue={obj?.branchIds || []}
            onSelect={handleSelect}
          />
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          {renderButton({
            name: 'SafetyTip',
            values: this.generateDoc(values),
            isSubmitted,
            object: safetyTip
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderForm} />;
  }
}

export default Form;
