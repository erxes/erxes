import Button from '@erxes/ui/src/components/Button';
import { ChildList } from '@erxes/ui/src/components/filterableList/styles';
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
  remove: (folderId: string) => void;
  loading: boolean;
  queryParams: any;
  parentFolderId: string;
  setParentId: (id: string) => void;
};

type State = {
  parentIds: { [key: string]: boolean };
};

class FolderList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      parentIds: props.parentFolderId ? { [props.parentFolderId]: true } : {}
    };
  }

  groupByParent = (array: any[]) => {
    const key = 'parentId';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  onToggle = parentIds => {
    this.setState({ parentIds });
  };

  renderRow(folder: IFolder, isChild: boolean) {
    const { remove, queryParams, setParentId, filemanagerFolders } = this.props;

    return (
      <FolderRow
        key={folder._id}
        isActive={queryParams ? queryParams._id === folder._id : false}
        folder={folder}
        remove={remove}
        queryParams={queryParams}
        isChild={isChild}
        isParent={folder?.hasChild ? folder.hasChild : false}
        setParentId={setParentId}
        onToggle={this.onToggle}
        parentIds={this.state.parentIds}
        filemanagerFolders={filemanagerFolders}
      />
    );
  }

  renderTree(parent, subFolders?) {
    const groupByParent = this.groupByParent(subFolders);
    const childrens = groupByParent[parent._id];

    if (childrens) {
      const isOpen = this.state.parentIds[parent._id];

      return (
        <>
          {this.renderRow(parent, true)}

          <ChildList>
            {isOpen &&
              childrens.map(childparent => (
                <React.Fragment key={childparent._id}>
                  {this.renderTree(childparent, subFolders)}
                </React.Fragment>
              ))}
          </ChildList>
        </>
      );
    }

    return this.renderRow(parent, false);
  }

  renderItems = () => {
    const { filemanagerFolders } = this.props;

    const parents = filemanagerFolders.filter(item => !item.parentId);
    const subFields = filemanagerFolders.filter(item => item.parentId);

    return parents.map((folder: IFolder) => (
      <React.Fragment key={folder._id}>
        {this.renderTree(folder, subFields)}
      </React.Fragment>
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
