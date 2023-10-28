import React from 'react';
import FilterableListStyles from '@erxes/ui/src/components/filterableList/styles';
import dayjs from 'dayjs';
import ThankForm from '../containers/ThankForm';
import {
  HeaderFeed,
  NavItem,
  NewsFeedLayout,
  TextFeed,
  FeedActions
} from '../styles';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import LoadMore from '@erxes/ui/src/components/LoadMore';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { getUserAvatar } from '@erxes/ui/src/utils/core';

const AvatarImg = FilterableListStyles.AvatarImg;

type Props = {
  list: any;
  totalCount: number;
  queryParams: any;
  deleteItem: (_id: string) => void;
  limit: number;
};

export default function ThankList({
  list,
  deleteItem,
  totalCount,
  queryParams,
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
        <ThankForm
          queryParams={queryParams}
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
              <b>
                <Icon icon="angle-right" size={14} />{' '}
                {item.recipients && item.recipients.length > 0
                  ? item.recipients[0].username
                  : ''}
              </b>
              <p>
                {dayjs(item.createdAt).format('lll')} <b>#{'ThankYou'}</b>
              </p>
            </div>
          </FeedActions>
          <FeedActions>
            <NavItem>
              <Dropdown alignRight={true}>
                <Dropdown.Toggle as={DropdownToggle} id="dropdown-user">
                  <Icon icon="ellipsis-h" size={14} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <li>{editItem(item)}</li>
                  <li>
                    <a onClick={() => deleteItem(item._id)}>Delete</a>
                  </li>
                </Dropdown.Menu>
              </Dropdown>
            </NavItem>
          </FeedActions>
        </HeaderFeed>
        <TextFeed>{item.description}</TextFeed>
      </div>
    );
  };

  return (
    <NewsFeedLayout>
      {(list || []).map(filteredItem => renderItem(filteredItem))}
      <LoadMore perPage={limit} all={totalCount} />
    </NewsFeedLayout>
  );
}
