import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ICms, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const CmsNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const CmsWrapper = styledTS<{ space: number }>(
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
  cms: ICms;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  cmss: ICms[];
  remove: (cms: ICms) => void;
  edit: (cms: ICms) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Cmss({ cms, checked }) {
    return <CmsNameStyled checked={checked}>{cms.name}</CmsNameStyled>;
  }

  removeCms = () => {
    const { remove, cms } = this.props;

    remove(cms);
  };

  toggleCheck = () => {
    const { edit, cms } = this.props;

    edit({ _id: cms._id, checked: !cms.checked });
  };

  render() {
    const { cms, renderButton, space, cmss, types } = this.props;

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
        cms={cms}
        renderButton={renderButton}
        cmss={cmss}
      />
    );

    const extractDate = cms.expiryDate
      ? cms.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <CmsWrapper space={space}>
            <FormControl
              componentclass='checkbox'
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={cms.checked || false}
            ></FormControl>
            <Margin>
              <this.Cmss cms={cms} checked={cms.checked || false} />
            </Margin>
          </CmsWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title='Edit cms'
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement='top'>
              <Button
                btnStyle='link'
                onClick={this.removeCms}
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
