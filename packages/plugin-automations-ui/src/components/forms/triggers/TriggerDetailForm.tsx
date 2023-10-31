import React from 'react';
import { ITrigger } from '../../../types';
import SegmentsForm from '@erxes/ui-segments/src/containers/form/SegmentsForm';
import { Description, FlexContainer, TriggerTabs } from '../../../styles';
import { ScrolledContent } from '@erxes/ui-automations/src/styles';
import { __ } from '@erxes/ui/src';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import ReEnrollmentContainer from '../../../containers/forms/triggers/ReEnrollment';
import { Button, ModalTrigger } from '@erxes/ui/src';
import DateSettings from './subForms/Date';
import { ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  closeModal: () => void;
  activeTrigger: ITrigger;
  contentId?: string;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
};

class TriggerDetailForm extends React.Component<
  Props,
  { activeTrigger: ITrigger; currentTab: string }
> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'new',
      activeTrigger: props.activeTrigger
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeTrigger !== this.props.activeTrigger) {
      this.setState({ activeTrigger: nextProps.activeTrigger });
    }
  }

  tabOnClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  renderContent() {
    const { activeTrigger } = this.state;

    const config = activeTrigger.config || {};

    if (this.state.currentTab === 'reenrollment') {
      return (
        <ReEnrollmentContainer
          segmentId={config.contentId}
          trigger={activeTrigger}
          closeModal={this.props.closeModal}
          addConfig={this.props.addConfig}
        />
      );
    }

    return (
      <SegmentsForm
        {...this.props}
        contentType={activeTrigger.type}
        closeModal={this.props.closeModal}
        id={config.contentId}
        hideDetailForm={true}
      />
    );
  }

  renderSettings() {
    const { activeTrigger, addConfig } = this.props;
    const config = activeTrigger.config || {};

    const onChange = config => {
      activeTrigger.config = config;
      addConfig(activeTrigger, activeTrigger.id, config);
    };

    const onClear = () => {
      const { contentId, reEnrollment, reEnrollmentRules } =
        activeTrigger?.config || {};

      activeTrigger.config = { contentId, reEnrollment, reEnrollmentRules };
      addConfig(activeTrigger, activeTrigger.id);
    };

    const trigger = <Button icon="settings" btnStyle="link" />;

    const content = () => {
      return (
        <>
          <DateSettings onChange={onChange} config={config} />
          <ModalFooter>
            <Button btnStyle="simple" onClick={onClear}>
              {__('Clear')}
            </Button>
          </ModalFooter>
        </>
      );
    };

    return (
      <ModalTrigger
        title="Trigger Settings"
        trigger={trigger}
        content={content}
        hideHeader={true}
      />
    );
  }

  render() {
    const { currentTab, activeTrigger } = this.state;

    return (
      <>
        <Description>
          <FlexContainer>
            <h4>
              {activeTrigger.label} {__('based')}
            </h4>
            {this.renderSettings()}
          </FlexContainer>
          <p>{activeTrigger.description}</p>
        </Description>
        <TriggerTabs>
          <Tabs full={true}>
            <TabTitle
              className={currentTab === 'new' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'new')}
            >
              {__('New trigger')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'reenrollment' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'reenrollment')}
            >
              {__('Re-enrollment')}
            </TabTitle>
          </Tabs>
        </TriggerTabs>
        <ScrolledContent>{this.renderContent()}</ScrolledContent>
      </>
    );
  }
}

export default TriggerDetailForm;
