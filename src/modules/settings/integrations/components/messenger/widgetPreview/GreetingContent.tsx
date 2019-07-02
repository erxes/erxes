import { Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import moment from 'moment';
import React from 'react';
import { ContentBox, ErxesContent, LeftSide, RightSide } from './styles';

function GreetingContent() {
  return (
    <ErxesContent>
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
              <img key="1" src="/images/avatar-colored.svg" alt="avatar" />
            </LeftSide>
            <RightSide>
              <div>{moment(new Date()).format('LT')}</div>
              <span>{__('User')}</span>
              <p>{__('We need your help!')}</p>
            </RightSide>
          </li>
        </ul>
      </ContentBox>
    </ErxesContent>
  );
}

export default GreetingContent;
