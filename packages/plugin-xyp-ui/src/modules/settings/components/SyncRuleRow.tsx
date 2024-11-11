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
import Form from './SyncRuleForm';
import { ISyncRule } from '../types';

export const TagWrapper = styledTS<{ space: number }>(styled.div)`
  padding-left: ${(props) => props.space * 20}px;
`;

type Props = {
  syncRule: ISyncRule;
  remove: (brandId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const Row: React.FC<Props> = (props) => {
  const { renderButton, remove, syncRule } = props;

  const renderEditAction = (syncRule) => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = (props) => (
      <Form {...props} syncRule={syncRule} extended={true} renderButton={renderButton} />
    );

    return (
      <ModalTrigger
        size="lg"
        title={__("Edit")}
        trigger={editTrigger}
        content={content}
      />
    );
  };

  const removeHandler = (syncRule) => {
    remove(syncRule);
  };

  return (
    <tr>
      <td>{syncRule.title || ''}</td>
      <td>{syncRule.serviceName || ''}</td>
      <td>{syncRule.responseKey}</td>
      <td>{syncRule.extractType}</td>
      <td>{syncRule.extractKey}</td>
      <td>{syncRule.objectType}</td>
      <td>{syncRule.fieldGroupObj?.name || syncRule.fieldGroup}</td>
      <td>{syncRule.formFieldObj?.text || syncRule.formField}</td>
      <td>
        <ActionButtons>
          {renderEditAction(syncRule)}
          <Tip text={__('Delete')} placement="bottom">
            <Button
              btnStyle="link"
              onClick={() => removeHandler(syncRule)}
              icon="times-circle"
            />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
