import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { IMessengerApps } from 'modules/settings/integrations/types';
import React from 'react';
import {
  ContentBox,
  ErxesContent,
  LeftSide,
  RightSide,
  Website
} from './styles';

type Props = {
  activeStep?: string;
  color?: string;
  messengerApps?: IMessengerApps;
};

function renderWebsiteApps(websites, color) {
  if (!websites || websites.length === 0) {
    return null;
  }

  return websites.map((website, index) => (
    <ContentBox key={index}>
      <Website color={color}>
        <p>{website.description}</p>
        <Button uppercase={false}>{website.buttonText}</Button>
      </Website>
    </ContentBox>
  ));
}

function GreetingContent(props: Props) {
  const { knowledgebases, websites } =
    props.messengerApps || ({} as IMessengerApps);

  const isTabbed =
    (knowledgebases || []).length !== 0 &&
    (knowledgebases || [])[0].topicId &&
    props.activeStep === 'addon'
      ? true
      : false;

  return (
    <ErxesContent isTabbed={isTabbed}>
      <ContentBox>
        <h4>{__('Recent conversations')}</h4>
        <ul>
          <li>
            <LeftSide>
              <span>
                <Icon icon="plus" />
              </span>
            </LeftSide>
            <RightSide>
              <span>{__('Start new conversation')}</span>
              <p>{__('Talk with support staff')}</p>
            </RightSide>
          </li>
          <li>
            <LeftSide>
              <img src="/images/avatar-colored.svg" alt="avatar" />
            </LeftSide>
            <RightSide>
              <div>{dayjs(new Date()).format('LT')}</div>
              <span>{__('User')}</span>
              <p>{__('We need your help!')}</p>
            </RightSide>
          </li>
        </ul>
      </ContentBox>
      {props.activeStep === 'addon' && renderWebsiteApps(websites, props.color)}
    </ErxesContent>
  );
}

export default GreetingContent;
