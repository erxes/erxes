import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { EMPTY_CONTENT_FILEMANAGER } from '../constants';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import FolderList from '../containers/folder/FolderList';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';

type Props = {
  queryParams: any;
};

function FileManager({ queryParams }: Props) {
  const title = <Title capitalize={true}>{__('FileManager')}</Title>;

  const content = <div>content</div>;

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('File Manager'), link: '/documents' }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('FileManager')} breadcrumb={breadcrumb} />
      }
      leftSidebar={
        <FolderList
          // currentCategoryId={currentCategory._id}
          // articlesCount={articlesCount}
          queryParams={queryParams}
        />
      }
      footer={<Pagination count={100} />}
      content={
        <DataWithLoader
          data={content}
          loading={false}
          count={100}
          emptyContent={<EmptyContent content={EMPTY_CONTENT_FILEMANAGER} />}
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
}

export default FileManager;
