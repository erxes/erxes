import React from 'react';
import { Link } from 'react-router-dom';
import * as dayjs from 'dayjs';
import { IScore } from '../types';

const route = type => {
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
      return `${owner?.firstName} ${owner?.lastName}`;
    case 'user':
      return owner?.details?.fullName;
    case 'company':
      return owner?.primaryName;
    case 'cpUser':
      return owner?.username || (owner?.firstName && owner?.lastName)
        ? `${owner?.firstName} ${owner.lastName}`
        : '-';
  }
};

function Row({ item }: { item: IScore }) {
  const { ownerType, ownerId, owner, changeScore, createdAt } = item || {};

  return (
    <tr key={item._id}>
      <td>
        <Link to={`/${route(ownerType)}/details/${ownerId}`}>
          {email(ownerType, owner)}
        </Link>
      </td>
      <td>{name(ownerType, owner)}</td>
      <td>{ownerType}</td>
      <td>{changeScore}</td>
      <td>{owner?.score || '-'}</td>
      <td>{dayjs(createdAt).format('lll')}</td>
    </tr>
  );
}

export default Row;
