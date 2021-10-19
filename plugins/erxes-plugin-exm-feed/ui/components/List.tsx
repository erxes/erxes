import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import { ModalTrigger, readFile, getUserAvatar, __ } from 'erxes-ui';
import FilterableListStyles from 'erxes-ui/lib/components/filterableList/styles';
import LoadMore from 'modules/common/components/LoadMore';
import Icon from 'modules/common/components/Icon';
import dayjs from 'dayjs';
import Form from '../containers/Form';
import {
  NewsFeedLayout,
  NavItem,
  Attachments,
  LikeCommentShare,
  HeaderFeed,
  TextFeed
} from '../styles';

const AvatarImg = FilterableListStyles.AvatarImg;

type Props = {
  list: any;
  totalCount: number;
  deleteItem: (_id: string) => void;
  limit: number;
  filter: string;
};

export default function List({
  list,
  deleteItem,
  totalCount,
  limit,
  filter
}: Props) {
  const editItem = item => {
    const trigger = (
      <span>
        <a>Edit</a>
      </span>
    );

    const content = props => {
      return <Form contentType={item.contentType} item={item} {...props} />;
    };

    return <ModalTrigger title='Edit' trigger={trigger} content={content} />;
  };

  const renderItem = (item: any) => {
    const createdUser = item.createdUser || {};

    return (
      <div key={item._id}>
        <HeaderFeed>
          <AvatarImg
            alt={
              (createdUser &&
                createdUser.details &&
                createdUser.details.fullName) ||
              'author'
            }
            src={getUserAvatar(createdUser)}
          />
          <div>
            <b>
              {createdUser &&
                ((createdUser.details && createdUser.details.fullName) ||
                  createdUser.username ||
                  createdUser.email)}
            </b>
            <p>
              {dayjs(item.createdAt).format('lll')} <b>#{item.contentType}</b>
            </p>
          </div>
          <NavItem>
            <Dropdown alignRight={true}>
              <Dropdown.Toggle as={DropdownToggle} id='dropdown-user'>
                <Icon icon='angle-down' size={14} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <li>{editItem(item)}</li>
                <li>
                  <a onClick={() => deleteItem(item._id)}>Delete</a>
                </li>
              </Dropdown.Menu>
            </Dropdown>
          </NavItem>
        </HeaderFeed>
        <TextFeed>
          <b dangerouslySetInnerHTML={{ __html: item.title }} />
          <p dangerouslySetInnerHTML={{ __html: item.description }} />
        </TextFeed>
        {(item.attachments || []).map((a, index) => {
          return (
            <a key={index} href={readFile(a.url)}>
              <Attachments>
                <b>
                  {a.name} <Icon icon='external-link-alt' />
                </b>
              </Attachments>
            </a>
          );
        })}
        {(item.images || []).map((image, index) => {
          return <img key={index} alt={image.name} src={readFile(image.url)} />;
        })}
        <LikeCommentShare>
          <b>{item.likeCount} Like</b>
          <b>{item.commentCount} Comments</b>
          <b>Share</b>
        </LikeCommentShare>
      </div>
    );
  };

  return (
    <NewsFeedLayout>
      {list
        .filter(item => (item.contentType || '').includes(filter))
        .map(filteredItem => renderItem(filteredItem))}
      <LoadMore perPage={limit} all={totalCount} />
    </NewsFeedLayout>
  );
}
