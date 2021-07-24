import { __ } from 'modules/common/utils';
import React from 'react';
import { FlexRow } from 'modules/settings/styles';
import { IAction, ITrigger } from '../../types';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';

const actions: IAction[] = JSON.parse(localStorage.getItem('actions') || '[]');
const triggers: ITrigger[] = JSON.parse(
  localStorage.getItem('triggers') || '[]'
);

type Props = {
  closeModal: () => void;
  closeParentModal: () => void;
};

type State = {
  activeTrigger: string;
};

class TriggerDetailForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      activeTrigger: ''
    };
  }

  onSave = () => {
    console.log('here');
    localStorage.setItem('actions', JSON.stringify(actions));
    localStorage.setItem('triggers', JSON.stringify(triggers));
    this.props.closeParentModal();
  };

  render() {
    return (
      <>
        <FlexRow>hi</FlexRow>
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
