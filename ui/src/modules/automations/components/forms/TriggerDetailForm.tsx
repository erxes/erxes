import { __ } from 'modules/common/utils';
import React from 'react';
import Select from 'react-select-plus';
import { IAction, ITrigger } from '../../types';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IForm } from 'modules/forms/types';

const actions: IAction[] = JSON.parse(localStorage.getItem('actions') || '[]');
const triggers: ITrigger[] = JSON.parse(
  localStorage.getItem('triggers') || '[]'
);

type Props = {
  closeModal: () => void;
  closeParentModal: () => void;
  forms: IForm[];
};

type State = {
  activeFormId: string;
};

class TriggerDetailForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      activeFormId: ''
    };
  }

  onSave = () => {
    localStorage.setItem('actions', JSON.stringify(actions));
    localStorage.setItem('triggers', JSON.stringify(triggers));
    this.props.closeParentModal();
  };

  onChangeForm = option => {
    this.setState({ activeFormId: option.value });
  };

  render() {
    const { forms } = this.props;

    const selectOptions = (array: IForm[] = []) => {
      return array.map(item => ({ value: item._id, label: item.title }));
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Select form')}</ControlLabel>
          <Select
            isRequired={true}
            value={this.state.activeFormId}
            options={selectOptions(forms)}
            onChange={this.onChangeForm}
            placeholder={__('Select')}
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={this.onSave}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default TriggerDetailForm;
