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
import { SidebarList } from '@erxes/ui/src/layout/styles';

type Props = {
  filemanagerFolders: IFolder[];
  // childrens: IFolder[];
  remove: (folderId: string) => void;
  loading: boolean;
  queryParams: any;
  parentFolderId: string;
  setParentId: (id: string) => void;
  // getSubfolders: (id: string, callback?: (data) => void) => void;
};

type State = {
  // childFolders: IFolder[];
  // parents: IFolder[];
  parentIds: { [key: string]: boolean };
};

class FolderList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      // childFolders: props.childrens || ([] as IFolder[]),
      // parents: props.filemanagerFolders || ([] as IFolder[]),
      parentIds: {}
    };
  }

  // componentWillReceiveProps(nextProps: Props) {
  //   const { childrens } = nextProps;
  //   console.log("childrens:", childrens);
  //   if (childrens !== this.state.childFolders) {
  //     this.setState({ childFolders: childrens });
  //   }
  // }

  setParentIds = parentIds => {
    this.setState({ parentIds });
  };

  groupByParent = (array: any[]) => {
    const key = 'parentId';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
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
        // getSubfolders={this.props.getSubfolders}
        filemanagerFolders={filemanagerFolders}
      />
    );
  }

  renderTree(parent, subFolders?) {
    const groupByParent = this.groupByParent(subFolders);
    const childrens = groupByParent[parent._id];
    // console.log("eee", parent, subFolders, groupByParent, childrens);
    if (childrens) {
      // const isOpen = this.state.parentIds[parent._id] || !!this.state.key;

      return (
        <>
          {this.renderRow(parent, true)}

          <ChildList>
            {childrens.map(childparent =>
              this.renderTree(childparent, subFolders)
            )}
          </ChildList>
        </>
      );
    }

    return this.renderRow(parent, false);
  }

  renderItems = () => {
    const { filemanagerFolders } = this.props;
    // const groupByParent = this.groupByParent(childrens);
    // console.log("parent folders", groupByParent);
    // const parents = this.props.parents.filter(item => !item.parentId);
    const parents = filemanagerFolders.filter(item => !item.parentId);
    const subFields = filemanagerFolders.filter(item => item.parentId);

    return parents.map((folder: IFolder) => {
      // const childs = groupByParent[folder._id] || [];
      // if (folder.parentId) {
      //   return null;
      // }

      return this.renderTree(folder, subFields);

      // return (
      //   <React.Fragment key={folder._id}>
      //     {this.renderRow(folder, false)}
      //     {(folder.childrens || []).map((child) => this.renderRow(child, true))}
      //   </React.Fragment>
      // );
    });
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
