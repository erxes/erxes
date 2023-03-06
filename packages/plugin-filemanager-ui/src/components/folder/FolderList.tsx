import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FolderForm from '../../containers/folder/FolderForm';
import FolderRow from './FolderRow';
import { Header } from '@erxes/ui-settings/src/styles';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IFolder } from '../../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';

type Props = {
  filemanagerFolders: IFolder[];
  remove: (folderId: string) => void;
  loading: boolean;
  queryParams: any;
  currentChannelId?: string;
};

class FolderList extends React.Component<Props, {}> {
  groupByParent = (array: any[]) => {
    const key = 'parentId';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  renderRow(folder: IFolder, isChild: boolean, isParent?: boolean) {
    const { remove, queryParams, filemanagerFolders } = this.props;

    return (
      <FolderRow
        key={folder._id}
        folder={folder}
        remove={remove}
        queryParams={queryParams}
        isChild={isChild}
        isParent={isParent}
        filemanagerFolders={filemanagerFolders}
      />
    );
  }

  renderItems = () => {
    const { filemanagerFolders } = this.props;

    const subFields = filemanagerFolders.filter(f => f.parentId);
    const parents = filemanagerFolders.filter(f => !f.parentId);
    const groupByParent = this.groupByParent(subFields);

    return parents.map((folder: IFolder) => {
      const childrens = groupByParent[folder._id] || [];

      return (
        <React.Fragment key={folder._id}>
          {this.renderRow(folder, false, childrens.length !== 0)}
          {childrens.map(child => this.renderRow(child, true))}
        </React.Fragment>
      );
    });
  };

  renderSidebarHeader() {
    const { filemanagerFolders } = this.props;

    const addFolder = (
      <Button btnStyle="success" block={true} icon="plus-circle">
        Add New Folder
      </Button>
    );

    const content = props => (
      <FolderForm {...props} filemanagerFolders={filemanagerFolders} />
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
    const { loading, filemanagerFolders } = this.props;

    return (
      <Sidebar wide={true} hasBorder={true} header={this.renderSidebarHeader()}>
        <DataWithLoader
          data={this.renderItems()}
          loading={loading}
          count={filemanagerFolders.length}
          emptyText="There is no folder"
          emptyImage="/images/actions/5.svg"
        />
      </Sidebar>
    );
  }
}

export default FolderList;
