import { IFile, IFolder } from '../../types';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { EMPTY_CONTENT_FILES } from '../../constants';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FileRow from './FileRow';
import FormControl from '@erxes/ui/src/components/form/Control';
import { ItemName } from '../../styles';
import React from 'react';
import { RowArticle } from './styles';
import SortHandler from '@erxes/ui/src/components/SortHandler';
import Spinner from '@erxes/ui/src/components/Spinner';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';

type Props = {
  files: IFile[];
  folders: IFolder[];
  queryParams: any;
  remove: (fileId: string) => void;
  loading: boolean;
};

class FileList extends React.Component<Props> {
  onChange = () => {
    // const { toggleAll, customers } = this.props;
    // toggleAll(customers, 'customers');
  };

  renderFiles() {
    const {
      files,
      folders,
      queryParams,
      // currentCategoryId,
      // topicId,
      remove
    } = this.props;

    return (
      <withTableWrapper.Wrapper>
        <Table
          whiteSpace="nowrap"
          hover={true}
          bordered={true}
          responsive={true}
          wideHeader={true}
        >
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={false}
                  componentClass="checkbox"
                  onChange={this.onChange}
                />
              </th>
              <th style={{ paddingLeft: '0' }}>
                <ItemName>
                  <img src="/images/folder.png" alt="folderImg" />
                  {__('Name')}
                </ItemName>
              </th>
              <th>
                <SortHandler
                  sortField={'createdAt'}
                  label={__('Created Date')}
                />
              </th>
              <th>
                <SortHandler sortField={'size'} label={__('Size')} />
              </th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody id="fileManagerfiles">
            <>
              {/* {folders.map((folder: IFolder) => (
                <FileRow
                  key={folder._id}
                  item={folder}
                  queryParams={queryParams}
                  isFolder={true}
                />
              ))} */}
              {files.map(file => (
                <FileRow
                  key={file._id}
                  item={file}
                  queryParams={queryParams}
                  remove={remove}
                />
              ))}
            </>
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );
  }

  render() {
    const { files, loading } = this.props;

    return (
      <DataWithLoader
        loading={loading}
        count={files.length}
        emptyContent={
          <EmptyState
            image="/images/actions/24.svg"
            text="No files at the moment!"
          />
        }
        data={this.renderFiles()}
      />
    );
  }
}

export default FileList;
