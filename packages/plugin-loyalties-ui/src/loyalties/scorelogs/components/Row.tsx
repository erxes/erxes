import { __, ActionButtons, Button, Icon, Table, Tip } from '@erxes/ui/src';
import * as dayjs from 'dayjs';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IScoreLogParams } from '../types';

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

type Props = {
  headers: string[];
  scoreLog: IScoreLogParams;
};

const AdditionalRow = ({ scoreLogs }: { scoreLogs: IScoreLogParams[] }) => {
  const renderContent = (scoreLog) => {
    const { target = [], type } = scoreLog || {};

    const [firstItem, ...restItem] = target;

    return (
      <>
        <tr>
          <td rowSpan={target?.length || 1}>
            {dayjs(scoreLog.createdAt).format('YYYY/MM/DD') || '-'}
          </td>
          <td rowSpan={target?.length || 1}>
            {scoreLog.target?.number || '-'}
          </td>
          <td rowSpan={target?.length || 1}>{type || '-'}</td>
          <td>{firstItem?.unitPrice || '-'}</td>
          <td>{firstItem?.count || firstItem?.quantity || '-'}</td>
          <td rowSpan={target?.length || 1}>
            {((scoreLog.action === 'add' ||
              (!scoreLog.action && scoreLog.changeScore > 0)) && (
              <>
                {scoreLog.changeScore} <Icon icon="arrow-up" />
              </>
            )) ||
              '-'}
          </td>
          <td rowSpan={target?.length || 1}>
            {((scoreLog.action === 'subtract' ||
              (!scoreLog.action && scoreLog.changeScore < 0)) && (
              <>
                {Math.abs(scoreLog.changeScore)} <Icon icon="arrow-down" />
              </>
            )) ||
              '-'}
          </td>
          <td rowSpan={target?.length || 1}>
            {scoreLog.campaign?.title || '-'}
          </td>
        </tr>
        {restItem?.map((item) => (
          <tr key={item._id} className="additional-row">
            <td>{item.unitPrice || '-'}</td>
            <td>{item.count || item.quantity || '-'}</td>
          </tr>
        ))}
      </>
    );
  };

  return (
    <SubTable>
      <thead>
        <tr>
          <th>Date</th>
          <th>Transation ID</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Quantity</th>
          <th>Points Earned</th>
          <th>Points Spent</th>
          <th>Campaign</th>
        </tr>
      </thead>
      <tbody>{scoreLogs.map((scoreLog) => renderContent(scoreLog))}</tbody>
    </SubTable>
  );
};

const Row = (props: Props) => {
  const { scoreLog, headers } = props;

  const [toggleRow, setToggleRow] = useState(false);

  const route = (type) => {
    switch (type) {
      case 'customer':
        return 'contacts';
      case 'user':
        return 'settings/team';
      case 'company':
        return 'companies';
      case 'cpUser':
        return 'settings/client-portal/users';
    }
  };

  const email = (type, owner) => {
    if (!owner) {
      return '-';
    }
    switch (type) {
      case 'customer':
        return owner?.primaryEmail;
      case 'user':
        return owner?.email;
      case 'company':
        return owner?.primaryEmail ? owner?.primaryEmail : owner?.primaryName;
      case 'cpUser':
        return owner?.email || '-';
    }
  };

  const name = (type, owner) => {
    if (!owner) {
      return '-';
    }

    switch (type) {
      case 'customer':
        return (
          `${owner?.firstName ?? ''} ${owner?.lastName ?? ''}`.trim() || '-'
        );
      case 'user':
        return owner?.details?.fullName ?? '-';
      case 'company':
        return owner?.primaryName ?? '-';
      case 'cpUser':
        if (owner?.username) {
          return owner.username;
        }
        if (owner?.firstName && owner?.lastName) {
          return `${owner.firstName} ${owner.lastName}`;
        }
        return '-';
      default:
        return '-';
    }
  };

  const phone = (type, owner) => {
    if (!owner) {
      return '-';
    }

    switch (type) {
      case 'customer':
      case 'company':
        return owner?.phones?.length ? owner.phones[0] : '-';
      case 'user':
        return owner?.primaryPhone || owner?.details?.operatorPhone || '-';
      case 'cpUser':
        return owner?.phone || '-';
      default:
        return '-';
    }
  };

  const score = (scoreLogs) => {
    let totalScore = 0;

    if (scoreLogs?.length) {
      for (const scoreLog of scoreLogs) {
        const { action, changeScore } = scoreLog;

        if (action === 'subtract') {
          totalScore -= changeScore;
        } else {
          totalScore += changeScore;
        }
      }
    }

    return totalScore || '-';
  };

  return (
    <>
      <tr key={scoreLog.ownerId}>
        <td>{name(scoreLog.ownerType, scoreLog.owner)}</td>
        <td>{email(scoreLog.ownerType, scoreLog.owner)}</td>
        <td>{phone(scoreLog.ownerType, scoreLog.owner)}</td>
        <td>{scoreLog.ownerType}</td>
        <td>{score(scoreLog.scoreLogs)}</td>
        <td>
          <ActionButtons>
            <Link
              to={`/${route(scoreLog.ownerType)}/details/${scoreLog.ownerId}`}
            >
              <Tip text={__(`Jump`)} placement="top">
                <Icon icon="external-link-alt" />
              </Tip>
            </Link>
            <Tip text={__(toggleRow ? 'Collapse' : 'Expand')} placement="top">
              <Button
                btnStyle="link"
                onClick={() => setToggleRow(!toggleRow)}
                icon={toggleRow ? 'angle-up' : 'angle-down'}
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>

      {toggleRow && (
        <tr>
          <td
            colSpan={headers.length}
            style={{ textAlign: 'left', backgroundColor: '#FAFAFA' }}
          >
            <AdditionalRow scoreLogs={scoreLog.scoreLogs as any} />
          </td>
        </tr>
      )}
    </>
  );
};

export default Row;
