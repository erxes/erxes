import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import { __ } from '@erxes/ui/src/utils/core';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import { Link } from 'react-router-dom';
import React from 'react';
import { IPageDoc } from '../../types';

type Props = {
  page: IPageDoc;
  history: any;
  remove: (_id: string) => void;
};

class Row extends React.Component<Props> {
  manageAction(contentType) {
    const { _id } = contentType;

    return (
      <Link to={`pages/edit/${_id}`}>
        <Button btnStyle="link">
          <Tip text={__('Manage')} placement="top">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  }

  renderRemoveAction() {
    const { page, remove } = this.props;

    const onClick = () => remove(page._id);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  }
  render() {
    const { page, history } = this.props;

    const onTrClick = () => {
      history.push(`/webbuilder/pages/edit/${page._id}`);
    };

    const { name, description } = page;

    return (
      <tr onClick={onTrClick}>
        <td>{name}</td>
        <td>{description}</td>
        <td>
          <ActionButtons>
            {this.manageAction(page)}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
