import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';

import { IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { SelectOwner } from '../utils';

type Props = {
  closeModal: () => void;
  renderButton: (props: any) => JSX.Element;
};
type State = {
  ownerType: string;
  ownerId: string;
  changeScore: number;
};
class ScoreForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      ownerType: 'customer',
      ownerId: '',
      changeScore: 0
    };
  }

  generateDoc = values => {
    const { ownerId } = this.state;

    return {
      ...values,
      changeScore: Number(values?.changeScore || 0),
      ownerId
    };
  };

  renderForm = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { changeScore } = this.state;
    const { values, isSubmitted } = formProps;

    const onChange = (value, name) => {
      this.setState(prev => ({ ...prev, [name]: value }));
    };

    return (
      <>
        <SelectOwner obj={this.state} onChange={onChange} />
        <FormGroup>
          <ControlLabel>{__('Score')}</ControlLabel>
          <FormControl
            {...formProps}
            name="changeScore"
            type="number"
            min={0}
            max={100}
            placeholder="0"
            required={true}
            defaultValue={changeScore}
          />
        </FormGroup>
        <ModalFooter>
          <Button btnStyle="simple" icon="cancel-1" onClick={closeModal}>
            {__('Close')}
          </Button>
          {renderButton({
            name: 'score',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderForm} />;
  }
}

export default ScoreForm;
