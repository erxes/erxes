import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import Form from '@erxes/ui/src/tags/components/Form';
import { IRemainder } from '../types';

export const TagWrapper = styledTS<{ space: number }>(styled.div)`
  padding-left: ${props => props.space * 20}px;
`;

type Props = {
  remainder: IRemainder;
};

type State = {
  showMerge: boolean;
  mergeDestination?: { value: string; label: string };
};
class Row extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { remainder } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = props => <Form {...props} />;

    return (
      <tr>
        <td></td>
        <td>{remainder.productId || '-'}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit tag"
              trigger={editTrigger}
              content={content}
            />
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
