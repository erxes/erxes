import { ActionButtons, SidebarListItem } from '@erxes/ui-settings/src/styles';
import { FolderItemRow, RowActions, SectionHead, SectionTitle } from './styles';

import Button from '@erxes/ui/src/components/Button';
import FolderForm from '../../containers/folder/FolderForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IFolder } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';

type Props = {
  folder: IFolder;
  filemanagerFolders: IFolder[];
  remove: (folderId: string) => void;
  queryParams: any;
  isChild?: boolean;
  isParent?: boolean;
};

class FolderRow extends React.Component<Props, {}> {
  remove = () => {
    const { remove, folder } = this.props;
    remove(folder._id);
  };

  renderEditAction = () => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => <FolderForm {...props} {...this.props} />;

    return (
      <ModalTrigger title="Edit" trigger={editTrigger} content={content} />
    );
  };

  render() {
    const { folder, isChild, isParent } = this.props;

    return (
      <FolderItemRow key={folder._id} isChild={isChild}>
        <Link to={`?_id=${folder._id}`}>
          <div>{folder.name}</div>
          {isParent && <Icon icon="angle-down" />}
        </Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete" placement="bottom">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </FolderItemRow>
    );
  }
}

export default FolderRow;
