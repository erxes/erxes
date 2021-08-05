import { __ } from 'modules/common/utils';
import React from 'react';
import { TriggerBox } from '../../styles';
import Icon from 'modules/common/components/Icon';
import { FlexRow } from 'modules/settings/styles';
import TriggerDetailForm from './TriggerDetailForm';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { TRIGGERS } from 'modules/automations/constants';

type Props = {
  closeModal: () => void;
  addTrigger: (value: string) => void;
};

type State = {
  mainType: string;
};

class TriggerForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      mainType: ''
    };
  }

  renderBox(key: string, icon: string, text: string) {
    const { closeModal, addTrigger } = this.props;

    const trigger = (
      <TriggerBox>
        <Icon icon={icon} size={30} />
        {__(text)}
      </TriggerBox>
    );

    const content = props => (
      <TriggerDetailForm
        closeParentModal={closeModal}
        activeTrigger={{
          type: key
        }}
        addTrigger={addTrigger}
        {...props}
      />
    );

    return (
      <ModalTrigger
        title={`${text} options`}
        trigger={trigger}
        content={content}
        size="lg"
      />
    );
  }

  renderSubTriggers() {
    const { mainType } = this.state;

    if (!mainType) {
      return null;
    }

    const trigger: any = TRIGGERS.find(t => t.type === mainType) || {};

    const subTriggerTypes = trigger.subTriggers || [];

    const subTriggers: any[] = [];

    subTriggerTypes.forEach(type => {
      const result = TRIGGERS.find(e => e.type === type);
      if (result) {
        subTriggers.push(result);
      }
    });

    return (
      <FlexRow>
        {subTriggers.map((t, index) => (
          <React.Fragment key={index}>
            {this.renderBox(t.type, t.icon, t.label)}
          </React.Fragment>
        ))}
      </FlexRow>
    );
  }

  render() {
    const onClickTrigger = e => {
      this.setState({ mainType: TRIGGERS[e.currentTarget.id].type });
    };

    return (
      <>
        <FlexRow>
          {TRIGGERS.map((trigger, index) => (
            <React.Fragment key={index}>
              <TriggerBox
                onClick={onClickTrigger}
                id={`${index}`}
                selected={trigger.type === this.state.mainType ? true : false}
                key={index}
              >
                <Icon icon={trigger.icon} size={30} />
                {__(trigger.label)}
              </TriggerBox>
            </React.Fragment>
          ))}
        </FlexRow>
        <br />
        {this.renderSubTriggers()}
      </>
    );
  }
}

export default TriggerForm;
