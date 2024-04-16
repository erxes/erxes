import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Form from './Form';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IBurenscoring, IType } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { colors, dimensions } from '@erxes/ui/src/styles';

const BurenscoringNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${props => (props.checked ? 'line-through' : 'none')}
    `;

export const BurenscoringWrapper = styledTS<{ space: number }>(
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
  burenscoring: any;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  burenscorings: any;
  remove: (burenscoring: IBurenscoring) => void;
  edit: (burenscoring: IBurenscoring) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Burenscorings({ burenscoring, checked }) {
    return <BurenscoringNameStyled checked={checked}>{burenscoring.name}</BurenscoringNameStyled>;
  }

  removeBurenscoring = () => {
    const { remove, burenscoring } = this.props;

    remove(burenscoring);
  };

  toggleCheck = () => {
    const { edit, burenscoring } = this.props;

    edit({ _id: burenscoring._id, checked: !burenscoring.checked });
  };

  render() {
    const { burenscoring, renderButton, space, burenscorings, types } = this.props;

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
        burenscoring={burenscoring}
        renderButton={renderButton}
        burenscorings={burenscorings}
      />
    );

    const extractDate = burenscoring.expiryDate
      ? burenscoring.expiryDate?.toString().split('T')[0]
      : '-';

    return (
      <tr>

      </tr>
    );
  }
}

export default Row;
