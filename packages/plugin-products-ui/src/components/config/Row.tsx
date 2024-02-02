import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import Form from './UomsForm';
import { IUom } from '../../types';

export const TagWrapper = styledTS<{ space: number }>(styled.div)`
  padding-left: ${(props) => props.space * 20}px;
`;

type Props = {
  uom: IUom;
  remove: (brandId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const Row: React.FC<Props> = (props) => {
  const { renderButton, remove, uom } = props;

  const renderEditAction = (uom) => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = (props) => (
      <Form {...props} uom={uom} extended={true} renderButton={renderButton} />
    );

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  const removeHandler = (uom) => {
    remove(uom);
  };

  return (
    <tr>
      <td>{uom.code || ''}</td>
      <td>{uom.name || ''}</td>
      <td>
        <ActionButtons>
          {renderEditAction(uom)}
          <Tip text={__('Delete')} placement="bottom">
            <Button
              btnStyle="link"
              onClick={() => removeHandler(uom)}
              icon="times-circle"
            />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
