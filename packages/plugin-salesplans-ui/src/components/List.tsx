import React, { useState, useEffect } from 'react';
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
import { Link } from 'react-router-dom';
// import Item from "../containers/Item";
type Props = {
  // type: any;
  data: any;
  removedata: (_id: string) => void;
};

function List({ data, removedata }: Props) {
  const [saleslogs, setSaleslogs] = useState(data);

  useEffect(() => {
    setSaleslogs(data);
  }, [data]);

  const removeSalesLog = (index, id) => {
    setSaleslogs(saleslogs.filter((_element, i) => i !== index));
  };

  const editSalesLog = data => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = formProps => {
      return <DateCooserContainer data={data} {...formProps} />;
    };
    return (
      <ModalTrigger
        title={`Setting`}
        trigger={trigger}
        content={content}
        isAnimate={true}
      />
    );
  };

  const removeDataLabel = (id, index) => {
    removedata(id);
    setSaleslogs(saleslogs.filter((_element, i) => i !== index));
  };

  const renderTable = () => {
    const labelsStype = 'success';
    if (data.length === 0 && saleslogs.length === 0) {
      return (
        <EmptyState image="/images/actions/12.svg" text="No SaleLogs" size="" />
      );
    }
    const table =
      saleslogs.map((t, index) => {
        return (
          <tbody>
            <tr>
              <td>
                <RowTitle>
                  <Link to={`/erxes-plugin-jurur-cake/saleLogDetails/${t._id}`}>
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
                  {editSalesLog(t)}
                  <Tip text={__('Duplicate')} placement="bottom">
                    <Button
                      id="edit-box-line"
                      btnStyle="link"
                      // onClick={(e) => removeDataLabel(index, t._id)}
                    >
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
