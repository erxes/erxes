import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import React from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import PostForm from '../containers/Form';

type Props = {
  post: any;
  remove: (_id: string) => void;
};

const Row = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { post, remove } = props;
  const user = post.author;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(post._id);
    };

    return (
      <Tip text={__('Delete')} placement='top'>
        <Button
          id='directionDelete'
          btnStyle='link'
          onClick={onClick}
          icon='times-circle'
        />
      </Tip>
    );
  };

  const renderEditAction = () => {
    const onClick = () => {
      navigate(`${location.pathname}/edit/${post._id}`, { replace: true });
    };

    return (
      <Tip text={__('Edit')} placement='top'>
        <Button
          id='directionEdit'
          btnStyle='link'
          onClick={onClick}
          icon='edit'
        />
      </Tip>
    );
  };

  const getFullName = (doc) => {
    return doc.details ? doc.details.fullName : 'Unknown';
  };

  const formContent = (formProps) => <PostForm {...formProps} post={post} />;

  const categories = post.categories || [];
  const tags = post.tags || [];

  const renderUser = (user) => {
    return (
      <>
        <NameCard.Avatar user={user} size={20} />
        <RowTitle>{(user && getFullName(user)) || 'Unknown'} </RowTitle>
      </>
    );
  };

  const renderCPUser = (user) => {
    let name = (user.firstName || '') + ' ' + (user.lastName || '');

    if (name.length === 0) {
      name = user.email || user.username || user.phone || 'Unknown';
    }

    const userDoc = {
      _id: user._id,
      details: {
        avatar: user.avatar,
        fullName: name,
      },
    };

    return (
      <>
        <NameCard.Avatar user={userDoc} size={20} />
        <RowTitle>{name} </RowTitle>
      </>
    );
  };

  return (
    <tr>
      <td key={post._id + 'title'}>
        <RowTitle>{post.title || '-'}</RowTitle>
      </td>

      <td key={post._id + 'type'}>
        <RowTitle>{post.customPostType.label || '-'}</RowTitle>
      </td>

      <td key={post._id + 'categories'}>
        <RowTitle>{categories.map((e) => e.name).join(', ') || '-'} </RowTitle>
      </td>

      <td key={post._id + 'tags'}>
        <RowTitle>{tags.map((e) => e.name).join(', ') || '-'}</RowTitle>
      </td>

      <td key={post._id + 'status'}>
        <RowTitle>{post.status || '-'}</RowTitle>
      </td>

      <td key={post._id + 'author'}>
        {post.authorKind === 'user' ? renderUser(user) : renderCPUser(user)}
      </td>

      <td>
        <Icon icon='calender' />{' '}
        <DateWrapper>{dayjs(post.createdAt).format('lll')}</DateWrapper>
      </td>

      <td>
        <Icon icon='calender' />{' '}
        <DateWrapper>{dayjs(post.createdAt).format('lll')}</DateWrapper>
      </td>

      <td>
        <Icon icon='calender' />{' '}
        <DateWrapper>{dayjs(post.createdAt).format('lll')}</DateWrapper>
      </td>

      <td>
        <ActionButtons>
          {renderEditAction()}
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
