import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React, { useState } from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Tests from './Test';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ITest, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

export const TestWrapper = styledTS<{ space: number }>(
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
  test: ITest;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  tests: ITest[];
  remove: (test: ITest) => void;
  edit: (test: ITest) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  removeTest = () => {
    const { remove, test } = this.props;

    remove(test);
  };

  toggleCheck = () => {
    const { edit, test } = this.props;

    edit({ _id: test._id, checked: !test.checked });
  };

  render() {
    const { test, renderButton, space, tests, types } = this.props;

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
        test={test}
        renderButton={renderButton}
        tests={tests}
      />
    );

    const extractDate = test.expiryDate
      ? test.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <TestWrapper space={space}>
            <FormControl
              componentClass="checkbox"
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={test.checked || false}
            ></FormControl>
            <Margin>
              <Tests test={test} checked={test.checked || false}></Tests>
            </Margin>
          </TestWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit test"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeTest}
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
