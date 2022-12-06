import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IMobinet, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const MobinetNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const MobinetWrapper = styledTS<{ space: number }>(
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
  mobinet: IMobinet;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  mobinets: IMobinet[];
  remove: (mobinet: IMobinet) => void;
  edit: (mobinet: IMobinet) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Mobinets({ mobinet, checked }) {
    return (
      <MobinetNameStyled checked={checked}>{mobinet.name}</MobinetNameStyled>
    );
  }

  removeMobinet = () => {
    const { remove, mobinet } = this.props;

    remove(mobinet);
  };

  toggleCheck = () => {
    const { edit, mobinet } = this.props;

    edit({ _id: mobinet._id, checked: !mobinet.checked });
  };

  render() {
    const { mobinet, renderButton, space, mobinets, types } = this.props;

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
        mobinet={mobinet}
        renderButton={renderButton}
        mobinets={mobinets}
      />
    );

    const extractDate = mobinet.expiryDate
      ? mobinet.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <MobinetWrapper space={space}>
            <FormControl
              componentClass="checkbox"
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={mobinet.checked || false}
            ></FormControl>
            <Margin>
              <this.Mobinets
                mobinet={mobinet}
                checked={mobinet.checked || false}
              />
            </Margin>
          </MobinetWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit mobinet"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeMobinet}
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
