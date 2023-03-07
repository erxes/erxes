import BreadCrumb from '@erxes/ui/src/components/breadcrumb/BreadCrumb';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FileForm from '../containers/file/FileForm';
import FileList from '../containers/file/FileList';
import FolderList from '../containers/folder/FolderList';
import { IFolder } from '../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';

type Props = {
  queryParams: any;
  filemanagerFolders: IFolder[];
  folderQueryLoading: boolean;
};

function FileManager({
  queryParams,
  filemanagerFolders,
  folderQueryLoading
}: Props) {
  const currentFolder = filemanagerFolders.find((folder: IFolder) =>
    queryParams && queryParams._id ? folder._id === queryParams._id : ''
  );
  console.log('curr:', currentFolder);
  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('File Manager'), link: '/documents' }
  ];

  const fileBreadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('File Manager'), link: '/documents' }
  ];

  const trigger = (
    <Button btnStyle="primary" icon="plus-circle">
      Add File
    </Button>
  );

  const content = props => <FileForm {...props} queryParams={queryParams} />;

  const actionBarRight = (
    <ModalTrigger
      title="Add File"
      trigger={trigger}
      size="lg"
      autoOpenKey="showAddFileModal"
      content={content}
      enforceFocus={false}
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('FileManager')} breadcrumb={breadcrumb} />
      }
      leftSidebar={
        <FolderList
          queryParams={queryParams}
          filemanagerFolders={filemanagerFolders}
          loading={folderQueryLoading}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<BreadCrumb breadcrumbs={fileBreadcrumb} />}
          right={actionBarRight}
        />
      }
      content={
        <DataWithLoader
          data={<FileList queryParams={queryParams} />}
          loading={false}
          count={100}
          emptyContent={
            <EmptyState
              image="/images/actions/5.svg"
              text="No folders at the moment!"
            />
          }
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
}

export default FileManager;
