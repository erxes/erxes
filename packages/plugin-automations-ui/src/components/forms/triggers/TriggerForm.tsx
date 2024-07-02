import React, { useState } from 'react';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __, confirm } from '@erxes/ui/src';
import {
  TypeBox,
  Description,
  TriggerTabs,
  TypeBoxContainer
} from '../../../styles';
import { ScrolledContent } from '@erxes/ui-automations/src/styles';
import { ITrigger } from '../../../types';
import { gql } from '@apollo/client';
import { mutations, queries } from '../../../graphql';
import Icon from '@erxes/ui/src/components/Icon';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import client from '@erxes/ui/src/apolloClient';

type Props = {
  onClickTrigger: (trigger: ITrigger) => void;
  templates: any[];
  triggersConst: ITrigger[];
};

export default function TriggerForm({
  onClickTrigger,
  templates,
  triggersConst
}: Props) {
  const [currentTab, setCurrentTab] = useState('new');
  const [currentType, setCurrentType] = useState('customer');

  const renderTemplateItem = (template: any, index: number) => {
    const onClickTemplate = () => {
      client
        .mutate({
          mutation: gql(mutations.automationsCreateFromTemplate),
          variables: {
            _id: template._id
          }
        })
        .then(({ data }) => {
          window.location.href = `/automations/details/${data.automationsCreateFromTemplate._id}`;
        });
    };

    const onRemoveTemplate = () => {
      confirm().then(() => {
        client.mutate({
          mutation: gql(mutations.automationsRemove),
          variables: {
            automationIds: [template._id]
          },
          refetchQueries: [
            {
              query: gql(queries.automations),
              variables: {
                status: 'template'
              }
            }
          ]
        });
      });
    };
    return (
      <TypeBoxContainer key={index}>
        <TypeBox onClick={onClickTemplate}>
          <FormGroup>
            <ControlLabel>{__(template.name)}</ControlLabel>
          </FormGroup>
        </TypeBox>
        <div className="ctrl">
          <Icon
            icon="trash"
            color="#EA475D"
            size={16}
            onClick={onRemoveTemplate}
          />
        </div>
      </TypeBoxContainer>
    );
  };

  const renderTriggerItem = (trigger: any, index: number) => {
    const onClickType = () => {
      setCurrentType(trigger.type);
      onClickTrigger(trigger);
    };
    return (
      <TypeBox key={index} onClick={onClickType}>
        <img src={`/images/actions/${trigger.img}`} alt={trigger.label} />
        <FormGroup>
          <ControlLabel>
            {__(trigger.label)} {!trigger?.isCustom && __('based')}
          </ControlLabel>
          <p>{__(trigger.description)}</p>
        </FormGroup>
      </TypeBox>
    );
  };

  return (
    <>
      <Description>
        <h4>{__('Choose your trigger type')}</h4>
        <p>
          {__('Start with an automation type that enrolls and triggers off')}
        </p>
      </Description>
      <TriggerTabs>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'new' ? 'active' : ''}
            onClick={() => setCurrentTab('new')}
          >
            {__('Start from scratch')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'library' ? 'active' : ''}
            onClick={() => setCurrentTab('library')}
          >
            {__('Library')}
          </TabTitle>
        </Tabs>
      </TriggerTabs>
      <ScrolledContent>
        {currentTab === 'library'
          ? templates.map((template, index) =>
              renderTemplateItem(template, index)
            )
          : triggersConst.map((template, index) =>
              renderTriggerItem(template, index)
            )}
      </ScrolledContent>
    </>
  );
}
