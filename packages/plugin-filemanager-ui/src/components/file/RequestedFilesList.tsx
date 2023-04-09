import { IAccessRequests, IFile } from '../../types';
import { __, renderUserFullName } from '@erxes/ui/src/utils/core';

import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { ItemName } from '../../styles';
import Label from '@erxes/ui/src/components/Label';
import React from 'react';
import Table from '@erxes/ui/src/components/table';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';
import { renderFileIcon } from '../../utils';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';

type Props = {
  requests: IAccessRequests[];
  onConfirm: (vars: any) => void;
  type?: string;
  hideActions?: boolean;
};

class RequestedFileList extends React.Component<Props> {
  render() {
    const { requests, onConfirm, hideActions } = this.props;

    if (!requests || requests.length === 0) {
      return (
        <EmptyState
          image="/images/actions/5.svg"
          text="No files at the moment!"
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
                <ItemName>{__('Size')}</ItemName>
              </th>
              <th>
                <ItemName>{__('Type')}</ItemName>
              </th>
              <th>
                <ItemName>{__('Status')}</ItemName>
              </th>
              <th>
                <ItemName>{__('Description')}</ItemName>
              </th>
              <th>
                <ItemName>
                  {hideActions ? __('User') : __('Requested user')}
                </ItemName>
              </th>
              <th>
                <ItemName>{__('Created Date')}</ItemName>
              </th>
              {!hideActions && (
                <th>
                  <ItemName>{__('Actions')}</ItemName>
                </th>
              )}
            </tr>
          </thead>
          <tbody id="fileManagerfiles">
            {requests.map(item => {
              const { type, name, contentType, info = {} as any } =
                item && item.file ? item.file : ({} as IFile);

              return (
                <tr key={item._id} className="crow">
                  <td style={{ paddingLeft: '0' }}>
                    <ItemName>
                      <a>
                        {renderFileIcon(
                          type === 'dynamic' ? 'aaa.dynamic' : info.name
                        )}
                        {contentType ? name : info.name}
                      </a>
                    </ItemName>
                  </td>
                  <td>{info.size && `${Math.round(info.size / 1000)} Kb`}</td>
                  <td>{info.type}</td>
                  <td>
                    <Label ignoreTrans={true}>{item.status}</Label>
                  </td>
                  <td>{item.description || '-'}</td>
                  <td>
                    {renderUserFullName(
                      hideActions ? item.toUser || {} : item.fromUser || {}
                    )}
                  </td>
                  <td>{dayjs(item.createdAt).format('MMMM D, YYYY h:mm A')}</td>
                  {!hideActions && (
                    <td>
                      <Button
                        btnStyle="success"
                        icon="checked-1"
                        size="small"
                        onClick={() => onConfirm(item._id)}
                      >
                        {this.props.type
                          ? 'Acknowledge request'
                          : 'Confirm request'}
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </withTableWrapper.Wrapper>
    );
  }
}

export default RequestedFileList;
