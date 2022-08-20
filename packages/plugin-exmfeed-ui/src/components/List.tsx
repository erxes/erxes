import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import {
  ModalTrigger,
  readFile,
  getUserAvatar,
  LoadMore,
  Icon,
  __
} from '@erxes/ui/src';
import FilterableListStyles from '@erxes/ui/src/components/filterableList/styles';
import dayjs from 'dayjs';
import Form from '../containers/Form';
import {
  NewsFeedLayout,
  NavItem,
  Attachments,
  LikeCommentShare,
  HeaderFeed,
  TextFeed,
  FeedActions
} from '../styles';

const AvatarImg = FilterableListStyles.AvatarImg;

type Props = {
  list: any;
  totalCount: number;
  deleteItem: (_id: string) => void;
  pinItem: (_id: string) => void;
  limit: number;
};

export default function List({
  list,
  deleteItem,
  pinItem,
  totalCount,
  limit
}: Props) {
  const editItem = item => {
    const trigger = (
      <span>
        <a>Edit</a>
      </span>
    );

    const content = props => {
      return (
        <Form
          contentType={item.contentType}
          item={item}
          transparent={true}
          {...props}
        />
      );
    };

    return <ModalTrigger title="Edit" trigger={trigger} content={content} />;
  };

  const renderItem = (item: any) => {
    const createdUser = item.createdUser || {};

    return (
      <div key={item._id}>
        <HeaderFeed>
          <FeedActions>
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
              {item.department ? (
                <p>
                  <Icon icon="building" size={16} />
                  {item.department}
                </p>
              ) : null}
              <p>
                {dayjs(item.createdAt).format('lll')} <b>#{item.contentType}</b>
              </p>
            </div>
          </FeedActions>
          <FeedActions showPin={item.isPinned}>
            <Icon icon="map-pin-alt" size={16} />
            <NavItem>
              <Dropdown alignRight={true}>
                <Dropdown.Toggle as={DropdownToggle} id="comment-settings">
                  <Icon icon="ellipsis-h" size={14} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <li>{editItem(item)}</li>
                  <li>
                    <a onClick={() => deleteItem(item._id)}>Delete</a>
                  </li>
                  <li>
                    <a onClick={() => pinItem(item._id)}>
                      {item.isPinned ? 'UnPin' : 'Pin'}
                    </a>
                  </li>
                </Dropdown.Menu>
              </Dropdown>
            </NavItem>
          </FeedActions>
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
                  {a.name} <Icon icon="external-link-alt" />
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

  const renderList = () => {
    const datas = list || [];
    const pinnedList = datas.filter(data => data.isPinned);
    const normalList = datas.filter(data => !data.isPinned);

    const showList = items => {
      return items.map(filteredItem => renderItem(filteredItem));
    };

    return (
      <>
        {showList(pinnedList)}
        {showList(normalList)}
      </>
    );
  };

  return (
    <NewsFeedLayout>
      {renderList()}
      <LoadMore perPage={limit} all={totalCount} />
    </NewsFeedLayout>
  );
}
