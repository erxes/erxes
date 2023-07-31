import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { IMeeting } from '../types';

const MeetingsNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const MeetingsWrapper = styledTS<{ space: number }>(
  styled.div
)`padding-left: ${props => props.space * 20}px;
  display:inline-flex;
  justify-content:flex-start;
  align-items: center;
`;

const Margin = styledTS(styled.div)`
 margin: ${dimensions.unitSpacing}px;
`;

type Props = {
  meetings: any;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  meetingDetail: IMeeting;
  remove: (meetings: IMeeting) => void;
  edit: (meetings: IMeeting) => void;
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Meetingss({ meetings, checked }) {
    return (
      <MeetingsNameStyled checked={checked}>{meetings.name}</MeetingsNameStyled>
    );
  }

  removeMeetings = () => {
    const { remove, meetings } = this.props;

    remove(meetings);
  };

  toggleCheck = () => {
    const { edit, meetings } = this.props;
  };

  render() {
    const { meetings, renderButton, space, meetingDetail } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3"></Icon>
        </Tip>
      </Button>
    );

    const content = props => (
      <Form
        {...props}
        types={[]}
        meetings={meetings}
        renderButton={renderButton}
        meetingss={meetingDetail}
      />
    );

    const extractDate = meetings.expiryDate
      ? meetings.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <MeetingsWrapper space={space}>
            <FormControl
              componentClass="checkbox"
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={meetings.checked || false}
            ></FormControl>
            <Margin>
              <this.Meetingss
                meetings={meetings}
                checked={meetings.checked || false}
              />
            </Margin>
          </MeetingsWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit meetings"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeMeetings}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
