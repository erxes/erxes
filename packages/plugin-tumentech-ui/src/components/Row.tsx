import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ITumentech, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const TumentechNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs(
  {}
)`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const TumentechWrapper = styledTS<{ space: number }>(
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
  tumentech: ITumentech;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  tumentechs: ITumentech[];
  remove: (tumentech: ITumentech) => void;
  edit: (tumentech: ITumentech) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Tumentechs({ tumentech, checked }) {
    return (
      <TumentechNameStyled checked={checked}>
        {tumentech.name}
      </TumentechNameStyled>
    );
  }

  removeTumentech = () => {
    const { remove, tumentech } = this.props;

    remove(tumentech);
  };

  toggleCheck = () => {
    const { edit, tumentech } = this.props;

    edit({ _id: tumentech._id, checked: !tumentech.checked });
  };

  render() {
    const { tumentech, renderButton, space, tumentechs, types } = this.props;

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
        tumentech={tumentech}
        renderButton={renderButton}
        tumentechs={tumentechs}
      />
    );

    const extractDate = tumentech.expiryDate
      ? tumentech.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <TumentechWrapper space={space}>
            <FormControl
              componentClass="checkbox"
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={tumentech.checked || false}
            ></FormControl>
            <Margin>
              <this.Tumentechs
                tumentech={tumentech}
                checked={tumentech.checked || false}
              />
            </Margin>
          </TumentechWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit tumentech"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeTumentech}
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
