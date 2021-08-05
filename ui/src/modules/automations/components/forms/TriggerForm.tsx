import { __ } from 'modules/common/utils';
import React from 'react';
import { TriggerBox } from '../../styles';
import Icon from 'modules/common/components/Icon';
import { FlexRow } from 'modules/settings/styles';
import TriggerDetailForm from './TriggerDetailForm';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { TRIGGERS } from 'modules/automations/constants';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { Row } from 'modules/settings/main/styles';

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
    const { mainType } = this.state;

    const onChangeTrigger = e => {
      const trigger = TRIGGERS.find(t => t.type === e.target.value);
      this.setState({ mainType: (trigger && trigger.type) || 'customer' });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Trigger</ControlLabel>
          <Row>
            <FormControl
              componentClass="select"
              placeholder={__('Select trigger')}
              defaultValue={mainType}
              onChange={onChangeTrigger}
            >
              <option />
              {TRIGGERS.map(trigger => (
                <option key={trigger.type} value={trigger.type}>
                  {trigger.label} based
                </option>
              ))}
            </FormControl>
          </Row>
        </FormGroup>
        <br />
        {this.renderSubTriggers()}
      </>
    );
  }
}

export default TriggerForm;
