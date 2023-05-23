import React from 'react';
import { IGrantRequest, IGrantResponse } from '../../common/type';
import { FlexCenterContent } from '@erxes/ui-log/src/activityLogs/styles';
import { ContentBox } from '@erxes/ui/src/layout';
import {
  ResponseCard,
  ResponseCardContent,
  ResponseCardDescription,
  Row
} from '../../styles';
import { ControlLabel, Icon, NameCard, Tip, __, colors } from '@erxes/ui/src';
import dayjs from 'dayjs';
import { ActivityDate } from '@erxes/ui-log/src/activityLogs/styles';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';

type Props = {
  detail: { responses: IGrantResponse[] } & IGrantRequest;
};

class DetailForm extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { detail } = this.props;
    const { requester, responses, actionLabel } = detail;

    const getIcon = response => {
      switch (response || '') {
        case 'approved':
          return <Icon icon="like-1" color={colors.colorCoreGreen} />;
        case 'declined':
          return <Icon icon="dislike" color={colors.colorCoreRed} />;
        case 'waiting':
          return <Icon icon="clock" color={colors.colorCoreBlue} />;
      }
    };

    return (
      <>
        <p>
          {__('Action:')}
          <ControlLabel>
            {__(`${actionLabel ? actionLabel : '-'}`)}
          </ControlLabel>
        </p>
        <FormWrapper>
          <FormColumn style={{ alignSelf: 'center' }}>
            <Row spaceBetween>
              <NameCard user={requester || {}} />
              <div style={{ alignSelf: 'center', margin: '0 1rem' }}>
                <Icon icon="rightarrow" />
              </div>
            </Row>
          </FormColumn>
          <FormColumn>
            {(responses || []).map(response => (
              <Row gap={25}>
                <ResponseCard key={response._id}>
                  <NameCard user={response?.user || {}} />
                  {response.description}
                  <Row gap={5}>
                    {getIcon(response.response)}
                    <Tip
                      text={
                        response?.createdAt
                          ? dayjs(response?.createdAt).format('llll')
                          : ''
                      }
                    >
                      <ActivityDate>
                        {response?.createdAt
                          ? dayjs(response?.createdAt).format('MMM D, h:mm A')
                          : ''}
                      </ActivityDate>
                    </Tip>
                  </Row>
                </ResponseCard>
              </Row>
            ))}
          </FormColumn>
        </FormWrapper>
      </>
    );
  }
}

export default DetailForm;
