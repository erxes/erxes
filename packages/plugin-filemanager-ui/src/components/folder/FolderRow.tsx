import { ActionButtons } from '@erxes/ui-settings/src/styles';
import Button from '@erxes/ui/src/components/Button';
import FolderForm from '../../containers/folder/FolderForm';
import { FolderItemRow } from './styles';
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
  setParentId: (id: string) => void;
  onToggle: any;
  parentIds: any;
  queryParams: any;
  isActive: boolean;
  isChild?: boolean;
  isParent?: boolean;
};

type State = {
  isParentOpen: boolean;
  parentIds: { [key: string]: boolean };
};

class FolderRow extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isParentOpen: props.isActive ? true : false,
      parentIds: props.parentIds || {}
    };
  }

  remove = () => {
    const { remove, folder } = this.props;
    remove(folder._id);
  };

  onParentOpen = (id: string, isOpen: boolean) => {
    const { setParentId, folder, onToggle } = this.props;

    const parentIds = this.state.parentIds;
    parentIds[id] = !isOpen;

    this.setState({ isParentOpen: !this.state.isParentOpen }, () => {
      setParentId(folder._id);
      onToggle(parentIds);
    });
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

  render() {
    const { folder, isActive, isChild, isParent } = this.props;

    const isOpen = this.state.parentIds[folder._id];

    return (
      <FolderItemRow
        key={folder._id}
        isChild={isChild}
        isParent={isParent}
        isActive={isActive}
      >
        <div onClick={this.onParentOpen.bind(this, folder._id, isOpen)}>
          {isParent && (
            <span className="toggle-icon">
              <Icon
                icon={`angle-${this.state.isParentOpen ? 'down' : 'right'}`}
                size={20}
              />
            </span>
          )}
          <Link to={`?_id=${folder._id}`}>
            <div>
              <img src="/images/folder.png" alt="folder" /> {folder.name}
            </div>
          </Link>
          <ActionButtons>
            {this.renderEditAction()}
            <Tip text="Go to Detail" placement="bottom">
              <Link to={`/filemanager/folder/details/${folder._id}`}>
                <Button btnStyle="link" icon="arrow-to-right" />
              </Link>
            </Tip>
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
