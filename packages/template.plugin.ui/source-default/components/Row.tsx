import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { I{Name}, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const {Name}NameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const {Name}Wrapper = styledTS<{ space: number }>(
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
  {name}: I{Name};
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  {name}s: I{Name}[];
  remove: ({name}: I{Name}) => void;
  edit: ({name}: I{Name}) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  {Name}s({ {name}, checked }) {
    return <{Name}NameStyled checked={checked}>{{name}.name}</{Name}NameStyled>;
  }

  remove{Name} = () => {
    const { remove, {name} } = this.props;

    remove({name});
  };

  toggleCheck = () => {
    const { edit, {name} } = this.props;

    edit({ _id: {name}._id, checked: !{name}.checked });
  };

  render() {
    const { {name}, renderButton, space, {name}s, types } = this.props;

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
        {name}={{name}}
        renderButton={renderButton}
        {name}s={{name}s}
      />
    );

    const extractDate = {name}.expiryDate
      ? {name}.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>
        <td>
          <{Name}Wrapper space={space}>
            <FormControl
              componentClass='checkbox'
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={{name}.checked || false}
            ></FormControl>
            <Margin>
              <this.{Name}s {name}={{name}} checked={{name}.checked || false} />
            </Margin>
          </{Name}Wrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title='Edit {name}'
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement='top'>
              <Button
                btnStyle='link'
                onClick={this.remove{Name}}
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
