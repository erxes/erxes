import React, { useEffect, useState } from 'react';
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
import { renderDynamicComponent } from '../../../utils';

type Props = {
  closeModal: () => void;
  activeTrigger: ITrigger;
  triggerConst: ITrigger;
  contentId?: string;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
};

function TriggerDetailForm(props: Props) {
  const { closeModal, contentId, addConfig, triggerConst } = props;

  const [currentTab, setCurrentTab] = useState('');
  const [activeTrigger, setActiveTrigger] = useState(props.activeTrigger || {});

  const { config = {} } = activeTrigger;

  useEffect(() => {
    setActiveTrigger(props.activeTrigger);
  }, [props.activeTrigger]);

  const tabOnClick = (currentTab: string) => {
    setCurrentTab(currentTab);
  };

  const renderContent = () => {
    if (currentTab === 'reenrollment') {
      return (
        <ReEnrollmentContainer
          segmentId={config.contentId}
          trigger={activeTrigger}
          closeModal={closeModal}
          addConfig={addConfig}
        />
      );
    }

    return (
      <SegmentsForm
        {...props}
        contentType={activeTrigger.type}
        closeModal={closeModal}
        id={config.contentId}
        hideDetailForm={true}
      />
    );
  };

  const renderSettings = () => {
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
        title={__("Trigger Settings")}
        trigger={trigger}
        content={content}
        hideHeader={true}
      />
    );
  };

  if (triggerConst.isCustom) {
    let Component = renderDynamicComponent(
      {
        ...props,
        componentType: 'triggerForm'
      },
      activeTrigger.type
    );

    if (Component) {
      return Component;
    }

    return null;
  }

  return (
    <>
      <Description>
        <FlexContainer>
          <h4>
            {activeTrigger.label} {!activeTrigger?.isCustom && __('based')}
          </h4>
          {renderSettings()}
        </FlexContainer>
        <p>{activeTrigger.description}</p>
      </Description>
      <TriggerTabs>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'new' ? 'active' : ''}
            onClick={tabOnClick.bind(this, 'new')}
          >
            {__('New trigger')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'reenrollment' ? 'active' : ''}
            onClick={tabOnClick.bind(this, 'reenrollment')}
          >
            {__('Re-enrollment')}
          </TabTitle>
        </Tabs>
      </TriggerTabs>
      <ScrolledContent>{renderContent()}</ScrolledContent>
    </>
  );
}

export default TriggerDetailForm;
