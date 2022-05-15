import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Info from '@erxes/ui/src/components/Info';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tags from '@erxes/ui/src/components/Tags';
import Tip from '@erxes/ui/src/components/Tip';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Select from 'react-select-plus';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import Form from '@erxes/ui/src/tags/components/Form';
import { IUom } from '../../types';

export const TagWrapper = styledTS<{ space: number }>(styled.div)`
  padding-left: ${props => props.space * 20}px;
`;

type Props = {
  uom: IUom;
};

type State = {
  showMerge: boolean;
  mergeDestination?: { value: string; label: string };
};
class Row extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { showMerge: false };
  }

  // removeTag = () => {
  //   const { remove, tag } = this.props;

  //   remove(tag);
  // };

  onChangeDestination = option => {
    this.setState({ mergeDestination: option });
  };

  render() {
    const { uom } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    return (
      <tr>
        <td>{uom.name || ''}</td>
        <td>{uom.code || ''}</td>
        <td>
          {/* <ActionButtons>
            <ModalTrigger
              title="Edit tag"
              trigger={editTrigger}
              content={() => void ()}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeTag}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons> */}
          edit remove
        </td>
      </tr>
    );
  }
}

export default Row;
