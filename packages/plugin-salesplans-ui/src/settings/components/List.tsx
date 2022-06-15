import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  __,
  Tip,
  Icon,
  Button,
  EmptyState,
  ActionButtons
} from '@erxes/ui/src';
import dayjs from 'dayjs';
import Label from '@erxes/ui/src/components/Label';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { Capitalize, RowTitle } from '../styles';

type Props = {
  data: any;
  removeData: (_id: string) => void;
};

function List(props: Props) {
  const { data = [], removeData } = props;
  const [salesLog, setSalesLog] = useState(data);

  useEffect(() => {
    if (data !== salesLog) setSalesLog(data);
  }, [data]);

  const removeDataLabel = (id: any, index: number) => {
    removeData(id);
    setSalesLog(salesLog.filter((_element: any, i: number) => i !== index));
  };

  const renderTable = () => {
    if (data && data.length === 0 && salesLog && salesLog.length === 0) {
      return (
        <EmptyState image="/images/actions/12.svg" text="No SaleLogs" size="" />
      );
    }

    const renderTableBody = () => {
      if (!salesLog || salesLog.length === 0) return null;

      return salesLog.map((item: any, index: number) => {
        console.log(item);
        return (
          <tbody key={index}>
            <tr>
              <td>
                <RowTitle>
                  <Link to={`/sales-plans/edit?salesLogId=${item._id}`}>
                    {item.name || ''}
                  </Link>
                </RowTitle>
              </td>
              <td>{item.branchDetail.title || 'Branch'}</td>
              <td>{item.departmentDetail.title || 'Department'}</td>
              <td>{item.type || 'Type'}</td>
              <td>
                <Label lblStyle="success">{__('Active')}</Label>
              </td>
              <td>
                <Icon icon="calender" />{' '}
                <DateWrapper>
                  {dayjs(item.createdAt).format('ll') || 'Created at'}
                </DateWrapper>
              </td>
              <td>
                <Capitalize>
                  {item.createdUser ? item.createdUser.username : ''}
                </Capitalize>
              </td>
              <td>
                <ActionButtons>
                  <Tip text={__('Submit')} placement="bottom">
                    <Link to="#">
                      <Button btnStyle="link">
                        <Icon icon="check-circle" />
                      </Button>
                    </Link>
                  </Tip>
                  <Tip text={__('Edit')} placement="bottom">
                    <Link to={`/sales-plans/edit?salesLogId=${item._id}`}>
                      <Button btnStyle="link">
                        <Icon icon="edit-3" />
                      </Button>
                    </Link>
                  </Tip>
                  <Tip text={__('Duplicate')} placement="bottom">
                    <Button id="edit-box-line" btnStyle="link">
                      <Icon icon="copy-1" />
                    </Button>
                  </Tip>
                  <Tip text={__('Remove')} placement="bottom">
                    <Button
                      id="edit-box-line"
                      btnStyle="link"
                      onClick={() => removeDataLabel(item._id, index)}
                    >
                      <Icon icon="times-circle" />
                    </Button>
                  </Tip>
                </ActionButtons>
              </td>
            </tr>
          </tbody>
        );
      });
    };

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Branch')}</th>
            <th>{__('Department')}</th>
            <th>{__('Type')}</th>
            <th>{__('Status')}</th>
            <th>{__('Created at')}</th>
            <th>{__('Created by')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        {renderTableBody()}
      </Table>
    );
  };

  return <>{renderTable()}</>;
}

export default List;
