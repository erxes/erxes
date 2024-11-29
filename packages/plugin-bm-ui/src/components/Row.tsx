import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IBm, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const BmNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const BmWrapper = styledTS<{ space: number }>(
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
  bm: IBm;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  bms: IBm[];
  remove: (bm: IBm) => void;
  edit: (bm: IBm) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Bms({ bm, checked }) {
    return <BmNameStyled checked={checked}>{bm.name}</BmNameStyled>;
  }

  removeBm = () => {
    const { remove, bm } = this.props;

    remove(bm);
  };

  toggleCheck = () => {
    const { edit, bm } = this.props;

    edit({ _id: bm._id, checked: !bm.checked });
  };

  render() {
    const { bm, renderButton, space, bms, types } = this.props;

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
        bm={bm}
        renderButton={renderButton}
        bms={bms}
      />
    );

    const extractDate = bm.expiryDate
      ? bm.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <BmWrapper space={space}>
            <FormControl
              componentclass='checkbox'
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={bm.checked || false}
            ></FormControl>
            <Margin>
              <this.Bms bm={bm} checked={bm.checked || false} />
            </Margin>
          </BmWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title='Edit bm'
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement='top'>
              <Button
                btnStyle='link'
                onClick={this.removeBm}
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
