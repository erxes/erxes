import React from 'react';
import { ModalTrigger, LoadMore, getUserAvatar, __ } from 'erxes-ui';
import FilterableListStyles from 'erxes-ui/lib/components/filterableList/styles';
import dayjs from 'dayjs';

import ThankForm from '../containers/ThankForm';

const AvatarImg = FilterableListStyles.AvatarImg;

type Props = {
  list: any;
  totalCount: number;
  queryParams: any;
  deleteItem: (_id: string) => void;
};

export default function ThankList({
  list,
  deleteItem,
  totalCount,
  queryParams
}: Props) {
  const editItem = item => {
    const trigger = (
      <span style={{ padding: '0 15px' }}>
        <a>Edit</a>
      </span>
    );

    const content = props => {
      return <ThankForm queryParams={queryParams} item={item} {...props} />;
    };

    return <ModalTrigger title="Edit" trigger={trigger} content={content} />;
  };

  const renderItem = (item: any, index: number) => {
    const createdUser = item.createdUser || {};

    return (
      <li key={item._id}>
        Number: {index} <br />
        <AvatarImg
          alt={
            (createdUser &&
              createdUser.details &&
              createdUser.details.fullName) ||
            'author'
          }
          src={getUserAvatar(createdUser)}
        />
        {__('Created By')}
        <div>
          {createdUser &&
            ((createdUser.details && createdUser.details.fullName) ||
              createdUser.username ||
              createdUser.email)}
        </div>
        {dayjs(item.createdAt).format('lll')} <br />
        {item.description} <br />
        {editItem(item)} <br />
        <a onClick={() => deleteItem(item._id)}>Delete</a>
      </li>
    );
  };

  const renderList = () => {
    return (
      <>
        <ul style={{ padding: '20px' }}>
          {list.map((item, index) => renderItem(item, index + 1))}
        </ul>
        <LoadMore perPage={20} all={totalCount} />
      </>
    );
  };

  return <div>{renderList()}</div>;
}
