import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FolderForm from '../../containers/folder/FolderForm';
import FolderRow from './FolderRow';
import { Header } from '@erxes/ui-settings/src/styles';
import { IFolder } from '../../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';

type Props = {
  filemanagerFolders: IFolder[];
  childrens: IFolder[];
  remove: (folderId: string) => void;
  loading: boolean;
  queryParams: any;
  currentChannelId?: string;
  setParentId: (id: string) => void;
};

class FolderList extends React.Component<Props, {}> {
  groupByParent = (array: any[]) => {
    const key = 'parentId';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  renderRow(folder: IFolder, isChild: boolean, isParent: boolean) {
    const { remove, queryParams, setParentId, filemanagerFolders } = this.props;

    return (
      <FolderRow
        key={folder._id}
        isActive={queryParams ? queryParams._id === folder._id : false}
        folder={folder}
        remove={remove}
        queryParams={queryParams}
        isChild={isChild}
        isParent={isParent}
        setParentId={setParentId}
        filemanagerFolders={filemanagerFolders}
      />
    );
  }

  renderItems = () => {
    const { filemanagerFolders, childrens } = this.props;

    const groupByParent = this.groupByParent(childrens);

    return filemanagerFolders.map((folder: IFolder) => {
      const childs = groupByParent[folder._id] || [];

      return (
        <React.Fragment key={folder._id}>
          {this.renderRow(folder, false, true)}
          {childs.map(child => this.renderRow(child, true, false))}
        </React.Fragment>
      );
    });
  };

  renderSidebarHeader() {
    const addFolder = (
      <Button btnStyle="success" block={true} icon="plus-circle">
        Add Root Folder
      </Button>
    );

    const content = props => (
      <FolderForm {...props} queryParams={this.props.queryParams} />
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
