import Button from '@erxes/ui/src/components/Button';
// import { ChildList } from '@erxes/ui/src/components/filterableList/styles';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FolderForm from '../../containers/folder/FolderForm';
import FolderRow from './FolderRow';
import { Header } from '@erxes/ui-settings/src/styles';
import { IFolder } from '../../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';

type Props = {
  folders: IFolder[];
  remove: (folderId: string) => void;
  loading: boolean;
  queryParams: any;
};

class FolderList extends React.Component<Props, { openFolderIds: string[] }> {
  constructor(props: Props) {
    super(props);

    this.state = { openFolderIds: [] };
  }

  toggleFolder = folderId => {
    const { openFolderIds } = this.state;

    const { folders } = this.props;
    const folder = folders.find(f => f._id === folderId);

    if (!folder) {
      return;
    }

    if (openFolderIds.includes(folderId)) {
      const idsToRemove: string[] = [];

      for (const f of folders) {
        if (f.order.startsWith(folder.order)) {
          idsToRemove.push(f._id);
        }
      }

      this.setState({
        openFolderIds: openFolderIds.filter(id => !idsToRemove.includes(id))
      });
    } else {
      for (const f of folders) {
        if (f.order.startsWith(folder.order)) {
          const [firstPart, lastPart] = f.order.split(folder.order);

          // is first child
          if (!lastPart.includes('/')) {
            openFolderIds.push(f._id);
          }
        }
      }

      this.setState({ openFolderIds });
    }
  };

  renderRow(folder) {
    const { remove, queryParams, folders } = this.props;
    const { openFolderIds } = this.state;

    if (folder.parentId && !openFolderIds.includes(folder.parentId)) {
      return null;
    }

    folder.isOpen = openFolderIds.includes(folder._id);
    folder.isParent =
      folders.filter(
        f => f._id !== folder._id && f.order.startsWith(folder.order)
      ).length > 0;

    return (
      <FolderRow
        key={folder._id}
        isActive={queryParams ? queryParams._id === folder._id : false}
        folder={folder}
        toggleFolder={this.toggleFolder}
        remove={remove}
        queryParams={queryParams}
      />
    );
  }

  renderItems = () => {
    const { folders } = this.props;

    return folders.map((folder: IFolder) => (
      <React.Fragment key={folder._id}>{this.renderRow(folder)}</React.Fragment>
    ));
  };

  renderSidebarHeader() {
    const addFolder = (
      <Button btnStyle="success" block={true} icon="plus-circle">
        Add Root Folder
      </Button>
    );

    const content = props => (
      <FolderForm {...props} queryParams={this.props.queryParams} root={true} />
    );

    return (
      <Header>
        <ModalTrigger
          title="New Folder"
          autoOpenKey="showFolderAddModal"
          trigger={addFolder}
          content={content}
          enforceFocus={false}
        />
      </Header>
    );
  }

  render() {
    const { loading, folders } = this.props;

    return (
      <Sidebar wide={true} hasBorder={true} header={this.renderSidebarHeader()}>
        <DataWithLoader
          data={this.renderItems()}
          loading={loading}
          count={folders.length}
          emptyText="There is no folder"
          emptyImage="/images/actions/5.svg"
        />
      </Sidebar>
    );
  }
}

export default FolderList;
