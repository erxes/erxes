import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IDictionary, IParent } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const ZmsNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const ZmsWrapper = styledTS<{ space: number }>(
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
  dictionary: IDictionary;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  dictionaries: IDictionary[];
  remove: (dictionary: IDictionary) => void;
  parents?: IParent[];
  parentId: string;
};

type State = {
  checked: boolean;
};

function Dictionaries({ dictionary, checked }) {
  return <ZmsNameStyled checked={checked}>{dictionary.name}</ZmsNameStyled>;
}

class Row extends React.Component<Props, State> {
  removeZms = () => {
    const { remove, dictionary } = this.props;

    remove(dictionary);
  };
  render() {
    const {
      dictionary,
      renderButton,
      space,
      dictionaries,
      parents,
      parentId
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
        types={parents}
        parentId={parentId}
        dictionary={dictionary}
        renderButton={renderButton}
        zmss={dictionaries}
      />
    );

    return (
      <tr>
        <td>
          <ZmsWrapper space={space}>
            <FormControl
              componentClass="checkbox"
              color={colors.colorPrimary}
              defaultChecked={dictionary.checked || false}
            ></FormControl>
            <Margin>
              <Dictionaries
                dictionary={dictionary}
                checked={dictionary.checked || false}
              />
            </Margin>
          </ZmsWrapper>
        </td>
        <td>
          <ZmsNameStyled checked={false}>{dictionary.code}</ZmsNameStyled>
        </td>
        <td>
          <ZmsNameStyled checked={false}>{dictionary.type}</ZmsNameStyled>
        </td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit zms"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeZms}
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
