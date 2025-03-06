import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IActivity, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const ActivityNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const ActivityWrapper = styledTS<{ space: number }>(
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
  activity: IActivity;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  activities: IActivity[];
  remove: (activity: IActivity) => void;
  edit: (activity: IActivity) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Activities({ activity, checked }) {
    return <ActivityNameStyled checked={checked}>{activity.name}</ActivityNameStyled>;
  }

  removeActivity = () => {
    const { remove, activity } = this.props;

    remove(activity);
  };

  toggleCheck = () => {
    const { edit, activity } = this.props;

    edit({ _id: activity._id, checked: !activity.checked });
  };

  render() {
    const { activity, renderButton, space, activities, types } = this.props;

    const editTrigger = (
      <Button btnStyle='link'>
        <Tip text={__('Edit')} placement='top'>
          <Icon icon='edit-3'></Icon>
        </Tip>
      </Button>
    );

    const content = props => (
      <Form
        {...props}
        types={types}
        activity={activity}
        renderButton={renderButton}
        activities={activities}
      />
    );

    const extractDate = activity.expiryDate
      ? activity.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <ActivityWrapper space={space}>
            <FormControl
              componentclass='checkbox'
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={activity.checked || false}
            ></FormControl>
            <Margin>
              <this.Activities activity={activity} checked={activity.checked || false} />
            </Margin>
          </ActivityWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title='Edit activity'
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement='top'>
              <Button
                btnStyle='link'
                onClick={this.removeActivity}
                icon='times-circle'
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
