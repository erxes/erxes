import React from 'react';
import { ModalTrigger, readFile, LoadMore, getUserAvatar, __ } from 'erxes-ui';
import FilterableListStyles from 'erxes-ui/lib/components/filterableList/styles';
import dayjs from 'dayjs';

import Form from '../containers/Form';

const AvatarImg = FilterableListStyles.AvatarImg;

type Props = {
  list: any;
  totalCount: number;
  deleteItem: (_id: string) => void;
};

export default function List({ list, deleteItem, totalCount }: Props) {
  const editItem = item => {
    const trigger = (
      <span style={{ padding: '0 15px' }}>
        <a>Edit</a>
      </span>
    );

    const content = props => {
      return <Form contentType={item.contentType} item={item} {...props} />;
    };

    return <ModalTrigger title='Edit' trigger={trigger} content={content} />;
  };

  const renderItem = (item: any, index: number) => {
    const createdUser = item.createdUser || {};

    return (
      <li key={item._id}>
        Number: {index} <br />#{item.contentType} <br />
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
        {item.title} <br />
        {item.description} <br />
        {(item.images || []).map((image, index) => (
          <img key={index} alt={image.name} src={readFile(image.url)} />
        ))}
        {(item.attachments || []).map((a, index) => (
          <a key={index} href={readFile(a.url)}>
            {a.name}
          </a>
        ))}
        {editItem(item)} <br />
        <a onClick={() => deleteItem(item._id)}>Delete</a>
      </li>
    );
  };

  const renderList = () => {
    return (
      <>
        <h3>Feed</h3>
        <ul style={{ padding: '20px', marginLeft: '40px' }}>
          {list.map((item, index) => renderItem(item, index + 1))}
        </ul>
        <LoadMore perPage={20} all={totalCount} />
      </>
    );
  };

  return <div>{renderList()}</div>;
}
