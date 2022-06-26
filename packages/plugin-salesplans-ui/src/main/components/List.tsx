import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  __,
  Tip,
  Icon,
  Button,
  EmptyState,
  ModalTrigger,
  ActionButtons
} from '@erxes/ui/src';
import dayjs from 'dayjs';
import Label from '@erxes/ui/src/components/Label';
import Form from '../containers/Form';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { Capitalize, RowTitle } from '../styles';

type Props = {
  data: any;
  editData: (_id: string, doc: any) => void;
  removeData: (_id: string) => void;
};

function List(props: Props) {
  const { data = [], editData, removeData } = props;
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

      const editLogTrigger = (
        <Button btnStyle="link">
          <Tip text={__('Edit')} placement="bottom">
            <Icon icon="edit-3" />
          </Tip>
        </Button>
      );

      return salesLog.map((item: any, index: number) => {
        const editLogContent = (formProps: any) => {
          return (
            <Form
              {...formProps}
              initialData={item}
              submit={data => editData(item._id, data)}
            />
          );
        };

        return (
          <tbody key={index}>
            <tr>
              <td>
                <RowTitle>{item.name || ''}</RowTitle>
              </td>
              <td>{(item.branchDetail || {}).title || 'Branch'}</td>
              <td>{(item.departmentDetail || {}).title || 'Department'}</td>
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
                  <Tip text={__('Archive')} placement="bottom">
                    <Button id="archive-box-line" btnStyle="link">
                      <Icon icon="archive-alt" />
                    </Button>
                  </Tip>
                  <Tip text={__('Products')} placement="bottom">
                    <Link to={`/sales-plans/products?salesLogId=${item._id}`}>
                      <Button id="product-box-line" btnStyle="link">
                        <Icon icon="box" />
                      </Button>
                    </Link>
                  </Tip>
                  <ModalTrigger
                    size="lg"
                    title={__('Edit')}
                    autoOpenKey="showSLEditSalesLogModal"
                    trigger={editLogTrigger}
                    content={editLogContent}
                    enforceFocus={false}
                  />
                  <Tip text={__('Duplicate')} placement="bottom">
                    <Button id="duplicate-box-line" btnStyle="link">
                      <Icon icon="copy-1" />
                    </Button>
                  </Tip>
                  <Tip text={__('Remove')} placement="bottom">
                    <Button
                      id="remove-box-line"
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
