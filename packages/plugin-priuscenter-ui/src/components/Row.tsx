import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IAd } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const AdNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const AdWrapper = styledTS<{ space: number }>(
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
  ad: IAd;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  ads: IAd[];
  remove: (ad: IAd) => void;
  edit: (ad: IAd) => void;
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Ads({ ad, checked }) {
    return <AdNameStyled checked={checked}>{ad.name}</AdNameStyled>;
  }

  removeAd = () => {
    const { remove, ad } = this.props;

    remove(ad);
  };

  render() {
    const { ad, renderButton, space, ads } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3"></Icon>
        </Tip>
      </Button>
    );

    const content = props => (
      <Form {...props} ad={ad} renderButton={renderButton} ads={ads} />
    );

    return (
      <tr>
        <td>{ad.type}</td>
        <td>{ad.title}</td>
        <td>{ad.mark}</td>
        <td>{ad.model}</td>

        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit ad"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeAd}
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
