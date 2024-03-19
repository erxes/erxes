import React from 'react';
import dayjs from 'dayjs';
import Form from 'react-bootstrap/Form';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import {
  ContentBox,
  ErxesContent,
  LeftSide,
  RightSide,
  TextContainer,
} from 'modules/saas/onBoarding/styles';

type Props = {
  color?: string;
};

function GreetingContent(props: Props) {
  return (
    <ErxesContent isTabbed={true}>
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
              <p>Our usual response time</p>
              <p> {'A few minutes'}</p>
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

      <ContentBox>
        <h4>{__('Do you want to learn more?')}</h4>

        <Form.Group>
          <Form.Control
            name="firstName"
            placeholder="Enter your email adress:"
            disabled={true}
          />
        </Form.Group>
      </ContentBox>

      <TextContainer>
        <h3>Powered by erxes</h3>
      </TextContainer>
    </ErxesContent>
  );
}

export default GreetingContent;
