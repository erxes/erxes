import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IPms, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const PmsNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const PmsWrapper = styledTS<{ space: number }>(
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
  pms: IPms;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  pmss: IPms[];
  remove: (pms: IPms) => void;
  edit: (pms: IPms) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Pmss({ pms, checked }) {
    return <PmsNameStyled checked={checked}>{pms.name}</PmsNameStyled>;
  }

  removePms = () => {
    const { remove, pms } = this.props;

    remove(pms);
  };

  toggleCheck = () => {
    const { edit, pms } = this.props;

    edit({ _id: pms._id, checked: !pms.checked });
  };

  render() {
    const { pms, renderButton, space, pmss, types } = this.props;

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
        pms={pms}
        renderButton={renderButton}
        pmss={pmss}
      />
    );

    const extractDate = pms.expiryDate
      ? pms.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <PmsWrapper space={space}>
            <FormControl
              componentclass='checkbox'
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={pms.checked || false}
            ></FormControl>
            <Margin>
              <this.Pmss pms={pms} checked={pms.checked || false} />
            </Margin>
          </PmsWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title='Edit pms'
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement='top'>
              <Button
                btnStyle='link'
                onClick={this.removePms}
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
