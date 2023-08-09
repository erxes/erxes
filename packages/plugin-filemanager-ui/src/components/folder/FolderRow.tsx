import { ActionButtons } from '@erxes/ui-settings/src/styles';
import Button from '@erxes/ui/src/components/Button';
import FolderForm from '../../containers/folder/FolderForm';
import { FolderItemRow } from './styles';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';

type Props = {
  folder;
  remove: (folderId: string) => void;
  queryParams: any;
  isActive: boolean;
  toggleFolder: (folderId: string) => void;
};

class FolderRow extends React.Component<Props> {
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

    const content = props => (
      <FolderForm
        {...props}
        folder={this.props.folder}
        queryParams={this.props.queryParams}
      />
    );

    return (
      <ModalTrigger title="Edit" trigger={editTrigger} content={content} />
    );
  };

  renderArrow() {
    const { folder, toggleFolder } = this.props;

    if (!folder.isParent) {
      return <span style={{ paddingLeft: '20px' }} />;
    }

    return (
      <span
        className="toggle-icon"
        onClick={toggleFolder.bind(this, folder._id)}
      >
        <Icon icon={`angle-${folder.isOpen ? 'down' : 'right'}`} size={20} />
      </span>
    );
  }

  render() {
    const { folder, isActive, toggleFolder } = this.props;
    const dept = folder.order.split('/').length;

    return (
      <FolderItemRow key={folder._id} isActive={isActive}>
        <div style={{ paddingLeft: `${(folder.parentId ? 15 : 0) * dept}px` }}>
          {this.renderArrow()}

          <Link to={`?_id=${folder._id}`}>
            <div>
              <img src="/images/folder.png" alt="folder" /> {folder.name}
            </div>
          </Link>
          <ActionButtons>
            {this.renderEditAction()}
            <Tip text="Delete" placement="bottom">
              <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
            </Tip>
          </ActionButtons>
        </div>
      </FolderItemRow>
    );
  }
}

export default FolderRow;
