import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IGoals, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const GoalsNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const GoalsWrapper = styledTS<{ space: number }>(
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
  goals: IGoals;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  goalss: IGoals[];
  remove: (goals: IGoals) => void;
  edit: (goals: IGoals) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Goalss({ goals, checked }) {
    return <GoalsNameStyled checked={checked}>{goals.name}</GoalsNameStyled>;
  }

  removeGoals = () => {
    const { remove, goals } = this.props;

    remove(goals);
  };

  toggleCheck = () => {
    const { edit, goals } = this.props;

    edit({ _id: goals._id, checked: !goals.checked });
  };

  render() {
    const { goals, renderButton, space, goalss, types } = this.props;

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
        types={types}
        goals={goals}
        renderButton={renderButton}
        goalss={goalss}
      />
    );

    const extractDate = goals.expiryDate
      ? goals.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <GoalsWrapper space={space}>
            <FormControl
              componentClass="checkbox"
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={goals.checked || false}
            ></FormControl>
            <Margin>
              <this.Goalss goals={goals} checked={goals.checked || false} />
            </Margin>
          </GoalsWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit goals"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeGoals}
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
