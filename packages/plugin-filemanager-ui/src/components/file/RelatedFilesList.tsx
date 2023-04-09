import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IFile } from '../../types';
import { ItemName } from '../../styles';
import React from 'react';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import { renderFileIcon } from '../../utils';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';

type Props = {
  files: IFile[];
  folderId: string;
};

class RelatedFileList extends React.Component<Props> {
  render() {
    const { files, folderId } = this.props;

    if (!files || files.length === 0) {
      return (
        <EmptyState
          image="/images/actions/5.svg"
          text="No related files at the moment!"
        />
      );
    }

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
              <th style={{ paddingLeft: '0' }}>
                <ItemName>{__('Name')}</ItemName>
              </th>
              <th>
                <ItemName>{__('Created Date')}</ItemName>
              </th>
              <th>
                <ItemName>{__('Size')}</ItemName>
              </th>
              <th>
                <ItemName>{__('Type')}</ItemName>
              </th>
            </tr>
          </thead>
          <tbody id="fileManagerfiles">
            {(files || []).map(item => {
              const { name = '', size, type } =
                item && item.info ? item.info : ({} as any);

              return (
                <tr key={item._id} className="crow">
                  <td style={{ paddingLeft: '0' }}>
                    <ItemName>
                      <a href={`/filemanager/details/${folderId}/${item._id}`}>
                        {renderFileIcon(
                          item.type === 'dynamic' ? 'aaa.dynamic' : name || ''
                        )}
                        {item.contentType ? item.name : name || ''}
                      </a>
                    </ItemName>
                  </td>
                  <td>{dayjs(item.createdAt).format('MMMM D, YYYY h:mm A')}</td>
                  <td>{size && `${Math.round(size / 1000)} Kb`}</td>
                  <td>{type}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );
  }
}

export default RelatedFileList;
