import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import { RowTitle } from '@erxes/ui-engage/src/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { IContentTypeDoc } from '../../types';

type Props = {
  contentType: IContentTypeDoc;
  remove: (contentTypeId: string) => void;
};

class Row extends React.Component<Props> {
  manageAction(contentType) {
    const { _id } = contentType;

    return (
      <Link to={`contenttypes/edit/${_id}`}>
        <Button btnStyle="link">
          <Tip text={__('Manage')} placement="top">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      </Link>
    );
  }

  renderRemoveAction() {
    const { contentType, remove } = this.props;

    const onClick = () => remove(contentType._id);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  }

  render() {
    const { contentType } = this.props;
    const { site } = contentType;

    return (
      <tr>
        <td>
          <RowTitle>
            <Link to={`contentTypes/edit/${contentType._id}`}>
              {contentType.displayName}
            </Link>
          </RowTitle>
        </td>
        <td>{contentType.code}</td>
        <td>{site?.name || ''}</td>
        <td>
          <ActionButtons>
            {this.manageAction(contentType)}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
