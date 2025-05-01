import {
  ActionButtons,
  Button,
  Table,
  TextInfo,
  Tip,
} from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import * as dayjs from 'dayjs';
import React, { useState } from 'react';
import styled from 'styled-components';
import { STATUS_MODE } from '../constants';
import { ICoupon } from '../types';

type Props = {
  item: ICoupon;
  columnLength: number;
};

const SubTable = styled(Table)`
  > thead > tr > th {
    background-color: #fafafa;
    padding: 8px !important;
    text-align: left !important;
  }

  > tbody > tr > td {
    padding: 8px !important;
    text-align: left !important;

    > i {
      margin-left: 5px;
    }

    .icon-arrow-down {
      color: #ff0000;
    }

    .icon-arrow-up {
      color: #00ff00;
    }
  }

  th:last-child,
  td:last-child {
    text-align: right !important;
  }

  > tbody > tr.additional-row td {
    text-align: left !important;
  }
`;

export const getOwnerPrimaryInfo = (type, owner) => {
  if (!owner || !type) {
    return '-';
  }

  return (
    {
      customer: [
        owner?.primaryEmail,
        `${owner?.firstName ?? ''} ${owner?.lastName ?? ''}`.trim(),
        owner?.phones?.[0],
      ],
      user: [
        owner?.email,
        owner?.details?.fullName,
        owner?.primaryPhone,
        owner?.details?.operatorPhone,
      ],
      company: [owner?.primaryEmail, owner?.primaryName, owner?.phones?.[0]],
      cpUser: [
        owner?.email,
        owner?.username,
        `${owner?.firstName ?? ''} ${owner?.lastName ?? ''}`.trim(),
        owner?.phone,
      ],
    }[type]?.find((value) => value) || '-'
  );
};

const AdditionalRow = ({ usageLogs }: any) => {
  const renderContent = (usageLog) => {
    return (
      <tr>
        <td>{usageLog.target || '-'}</td>
        <td>{usageLog.targetType || '-'}</td>
        <td>{getOwnerPrimaryInfo(usageLog.ownerType, usageLog.owner)}</td>
        <td>
          {usageLog.usedDate
            ? dayjs(usageLog.usedDate).format('YYYY/MM/DD LT')
            : '-'}
        </td>
      </tr>
    );
  };

  return (
    <SubTable>
      <thead>
        <tr>
          <th>Target</th>
          <th>Type</th>
          <th>Owner</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>{usageLogs.map((usageLog) => renderContent(usageLog))}</tbody>
    </SubTable>
  );
};

const Row = (props: Props) => {
  const { item, columnLength } = props;

  const [toggleRow, setToggleRow] = useState(false);

  if (!item) return <></>;

  const renderActions = () => {
    if (!(item.usageLogs || []).length) {
      return null;
    }

    return (
      <ActionButtons>
        <Tip text={__(toggleRow ? 'Collapse' : 'Expand')} placement="top">
          <Button
            btnStyle="link"
            onClick={() => setToggleRow(!toggleRow)}
            icon={toggleRow ? 'angle-up' : 'angle-down'}
          />
        </Tip>
      </ActionButtons>
    );
  };

  return (
    <>
      <tr key={item._id}>
        <td>{item.campaign?.title || '-'}</td>
        <td>{item.code || '-'}</td>
        <td>{item.usageCount || 0}</td>
        <td>{item.usageLimit || '-'}</td>
        <td>
          <TextInfo $textStyle={STATUS_MODE[item.status]}>
            {item.status || '-'}
          </TextInfo>
        </td>
        <td>{dayjs(item.createdAt).format('YYYY/MM/DD LT') || '-'}</td>
        <td>{renderActions()}</td>
      </tr>

      {toggleRow && (
        <tr>
          <td
            colSpan={columnLength}
            style={{ textAlign: 'left', backgroundColor: '#FAFAFA' }}
          >
            <AdditionalRow usageLogs={item.usageLogs as any} />
          </td>
        </tr>
      )}
    </>
  );
};

export default Row;
