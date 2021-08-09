import React from 'react';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { __ } from 'modules/common/utils';
import { TRIGGERS } from 'modules/automations/constants';
import FormGroup from 'erxes-ui/lib/components/form/Group';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import { TypeBox } from 'modules/automations/styles';
import { ITrigger } from 'modules/automations/types';

type Props = {
  onClickTrigger: (trigger: ITrigger) => void;
  addConfig: (mainType: string, value: string, contentId?: string) => void;
};

type State = {
  currentTab: string;
  currentType: string;
};

class TriggerForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'new',
      currentType: 'customer'
    };
  }

  tabOnClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  onClickType = (trigger: ITrigger) => {
    const { onClickTrigger } = this.props;

    this.setState({ currentType: trigger.type }, () => {
      onClickTrigger(trigger);
    });
  };

  renderScratchTemplates(trigger, index) {
    return (
      <TypeBox key={index} onClick={this.onClickType.bind(this, trigger)}>
        <img src={`../images/actions/${trigger.img}`} alt={trigger.label} />
        <FormGroup>
          <ControlLabel>{trigger.label} based</ControlLabel>
          <p>{trigger.description}</p>
        </FormGroup>
      </TypeBox>
    );
  }

  renderTabContent() {
    if (this.state.currentTab === 'library') {
      return <>library templates</>;
    }

    return TRIGGERS.map((trigger, index) =>
      this.renderScratchTemplates(trigger, index)
    );
  }

  render() {
    const { currentTab } = this.state;

    return (
      <>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'new' ? 'active' : ''}
            onClick={this.tabOnClick.bind(this, 'new')}
          >
            {__('Start from scratch')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'library' ? 'active' : ''}
            onClick={this.tabOnClick.bind(this, 'library')}
          >
            {__('Library')}
          </TabTitle>
        </Tabs>
        {this.renderTabContent()}
      </>
    );
  }
}

export default TriggerForm;
