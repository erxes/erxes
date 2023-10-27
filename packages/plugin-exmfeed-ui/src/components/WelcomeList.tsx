import React from 'react';
import { getUserAvatar, LoadMore, Icon, __ } from '@erxes/ui/src';
import FilterableListStyles from '@erxes/ui/src/components/filterableList/styles';
import dayjs from 'dayjs';
import {
  NewsFeedLayout,
  LikeCommentShare,
  HeaderFeed,
  TextFeed,
  FeedActions
} from '../styles';

const AvatarImg = FilterableListStyles.AvatarImg;

type Props = {
  list: any;
  totalCount: number;
  limit: number;
};

export default function WelcomeList({ list, totalCount, limit }: Props) {
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
        </HeaderFeed>
        <TextFeed>
          <b dangerouslySetInnerHTML={{ __html: item.title }} />
          <p dangerouslySetInnerHTML={{ __html: item.description }} />
        </TextFeed>

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

    const showList = items => {
      return items.map(filteredItem => renderItem(filteredItem));
    };

    return <>{showList(datas)}</>;
  };

  return (
    <NewsFeedLayout>
      {renderList()}
      <LoadMore perPage={limit} all={totalCount} />
    </NewsFeedLayout>
  );
}
