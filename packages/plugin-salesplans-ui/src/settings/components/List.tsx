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
import ModalTrigger from '@erxes/ui/src/components//ModalTrigger';
import DateCooserContainer from '../containers/DateChooser';

type Props = {
  // type: any;
  data: any;
  removedata: (_id: string) => void;
};

function List({ data, removedata }: Props) {
  const [salesLog, setSalesLog] = useState(data);

  useEffect(() => {
    setSalesLog(data);
  }, [data]);

  const removeDataLabel = (id, index) => {
    removedata(id);
    setSalesLog(salesLog.filter((_element: any, i: number) => i !== index));
  };

  const renderTable = () => {
    const labelsStype = 'success';
    if (data.length === 0 && salesLog.length === 0) {
      return (
        <EmptyState image="/images/actions/12.svg" text="No SaleLogs" size="" />
      );
    }
    const table =
      salesLog.map((t: any, index: number) => {
        return (
          <tbody key={index}>
            <tr>
              <td>
                <RowTitle>
                  <Link to={`/settings/sales-plans/edit?logId=${t._id}`}>
                    {t.name || ''}
                  </Link>
                </RowTitle>
              </td>
              <td>{t.branchDetail.title || 'Branch'}</td>
              <td>{t.unitDetail.title || 'Unit'}</td>
              <td>{t.type || 'Type'}</td>
              <td>
                <Label lblStyle={labelsStype}>{__('Active')}</Label>
              </td>
              <td>
                <Icon icon="calender" />{' '}
                <DateWrapper>
                  {dayjs(t.createdAt).format('ll') || 'Created at'}
                </DateWrapper>
              </td>
              <td>
                <Capitalize>
                  {t.createdUser ? t.createdUser.username : ''}
                </Capitalize>
              </td>
              <td>
                <ActionButtons>
                  <Tip text={__('Edit')} placement="bottom">
                    <Link to={`/settings/sales-plans/edit?logId=${t._id}`}>
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
                      onClick={e => removeDataLabel(t._id, index)}
                    >
                      <Icon icon="times-circle" />
                    </Button>
                  </Tip>
                </ActionButtons>
              </td>
            </tr>
          </tbody>
        );
      }) || '';

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Branch')}</th>
            <th>{__('Unit')}</th>
            <th>{__('Type')}</th>
            <th>{__('Status')}</th>
            <th>{__('Created at')}</th>
            <th>{__('Created by')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        {table}
      </Table>
    );
  };

  return <>{renderTable()}</>;
}

export default List;
