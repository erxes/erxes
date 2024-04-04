import {
  AvatarImg,
  FeedActions,
  HeaderFeed,
  LikeCommentShare,
  NewsFeedLayout,
  TextFeed
} from '../../styles';

import Icon from '../../../common/Icon';
import React from 'react';
import dayjs from 'dayjs';
import { getUserAvatar } from '../../../utils';
import Comments from '../../containers/feed/comment';
import ModalTrigger from '../../../common/ModalTrigger';
import Heart from '../../containers/feed/Heart';

import { InView } from 'react-intersection-observer';
import Spinner from '../../../common/Spinner';

type Props = {
  list: any;
  totalCount: number;
  loadMore: () => void;
};

export default function WelcomeList({ list, totalCount, loadMore }: Props) {
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
                {dayjs(item.createdAt).format('MM/DD/YYYY h:mm A')}{' '}
                <b>#{item.contentType}</b>
              </p>
            </div>
          </FeedActions>
        </HeaderFeed>
        <TextFeed>
          <b dangerouslySetInnerHTML={{ __html: item.title }} />
          <p dangerouslySetInnerHTML={{ __html: item.description }} />
        </TextFeed>
        <LikeCommentShare>
          <Heart _id={item._id} />
          <ModalTrigger
            title="Comment"
            size="lg"
            trigger={
              <b>
                <Icon icon="comment-1" /> {item.commentCount}
              </b>
            }
            content={(props) => <Comments contentId={item._id} {...props} />}
          />
          {/* <b>Share</b> */}
        </LikeCommentShare>
      </div>
    );
  };

  const renderList = () => {
    const datas = list || [];

    const showList = (items) => {
      return items.map((filteredItem) => renderItem(filteredItem));
    };

    const handleIntersection = (inView) => {
      if (inView && list.length !== totalCount) {
        loadMore();
      }
    };

    return (
      <>
        {showList(datas)}{' '}
        <InView onChange={handleIntersection}>
          {({ inView, ref }) => (
            <div ref={ref} style={{ height: '10px' }}>
              {inView && list.length !== totalCount && (
                <Spinner objective={true} />
              )}
            </div>
          )}
        </InView>
      </>
    );
  };

  return <NewsFeedLayout>{renderList()}</NewsFeedLayout>;
}
