import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ISyncpolaris, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const SyncpolarisNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs(
  {}
)`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const SyncpolarisWrapper = styledTS<{ space: number }>(
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
  syncpolaris: ISyncpolaris;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  syncpolariss: ISyncpolaris[];
  remove: (syncpolaris: ISyncpolaris) => void;
  edit: (syncpolaris: ISyncpolaris) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Syncpolariss({ syncpolaris, checked }) {
    return (
      <SyncpolarisNameStyled checked={checked}>
        {syncpolaris.name}
      </SyncpolarisNameStyled>
    );
  }

  removeSyncpolaris = () => {
    const { remove, syncpolaris } = this.props;

    remove(syncpolaris);
  };

  toggleCheck = () => {
    const { edit, syncpolaris } = this.props;

    edit({ _id: syncpolaris._id, checked: !syncpolaris.checked });
  };

  render() {
    const {
      syncpolaris,
      renderButton,
      space,
      syncpolariss,
      types
    } = this.props;

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
        syncpolaris={syncpolaris}
        renderButton={renderButton}
        syncpolariss={syncpolariss}
      />
    );

    const extractDate = syncpolaris.expiryDate
      ? syncpolaris.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <SyncpolarisWrapper space={space}>
            <FormControl
              componentClass="checkbox"
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={syncpolaris.checked || false}
            ></FormControl>
            <Margin>
              <this.Syncpolariss
                syncpolaris={syncpolaris}
                checked={syncpolaris.checked || false}
              />
            </Margin>
          </SyncpolarisWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit syncpolaris"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeSyncpolaris}
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
