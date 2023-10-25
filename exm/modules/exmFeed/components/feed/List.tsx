import {
  Attachments,
  AvatarImg,
  FeedActions,
  HeaderFeed,
  LikeCommentShare,
  NavItem,
  NewsFeedLayout,
  TextFeed,
  AttachmentContainer,
  MoreAttachment,
  EventInfo
} from '../../styles';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '../../../common/DropdownToggle';
import Form from '../../containers/feed/Form';
import Icon from '../../../common/Icon';
import ModalTrigger from '../../../common/ModalTrigger';
import React from 'react';
import dayjs from 'dayjs';
import { getUserAvatar } from '../../../utils';
import { readFile } from '../../../common/utils';
import withCurrentUser from '../../../auth/containers/withCurrentUser';
import { IUser } from '../../../types';
import AttachmentWithPreview from '../../../common/AttachmentWithPreview';
import Comments from '../../containers/feed/comment';
import Heart from '../../containers/feed/Heart';

import { InView } from 'react-intersection-observer';
import Spinner from '../../../common/Spinner';

type Props = {
  list: any;
  totalCount: number;
  deleteItem: (_id: string) => void;
  pinItem: (_id: string) => void;
  contentType: string;
  loadMore: () => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

function List({
  list,
  deleteItem,
  pinItem,
  currentUser,
  contentType,
  totalCount,
  loadMore
}: FinalProps) {
  const editItem = item => {
    const trigger = (
      <span>
        <a>Edit</a>
      </span>
    );

    const content = props => {
      const { closeModal } = props;

      return (
        <Form
          contentType={item.contentType}
          item={item}
          transparent={true}
          isEdit={true}
          closeModal={closeModal}
          {...props}
        />
      );
    };

    return (
      <ModalTrigger
        title="Edit"
        size="lg"
        trigger={trigger}
        content={content}
      />
    );
  };

  const renderItem = (item: any) => {
    const createdUser = item.createdUser || {};

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    let links = [];
    let updatedDescription = '';

    if (item.description) {
      const matches = item.description.match(urlRegex);

      if (matches) {
        updatedDescription = matches.reduce(
          (prevDescription, link) => prevDescription.replace(link, ''),
          item.description
        );

        links = matches;
      } else {
        updatedDescription = item.description;
      }
    }

    const renderImages = () => {
      if (item.images.length === 1) {
        return (
          <AttachmentWithPreview
            attachment={item.images[0]}
            attachments={item.images}
            size={600}
          />
        );
      }

      if (item.images.length === 2) {
        return (
          <>
            <AttachmentWithPreview
              attachment={item.images[0]}
              attachments={item.images}
              size={600}
            />
            <AttachmentWithPreview
              attachment={item.images[1]}
              attachments={item.images}
              size={600}
            />
          </>
        );
      }

      return (
        <>
          <AttachmentWithPreview
            attachment={item.images[0]}
            attachments={item.images}
            size={600}
          />
          <div>
            <AttachmentWithPreview
              attachment={item.images[1]}
              attachments={item.images}
              size={600}
            />
            <AttachmentWithPreview
              attachment={item.images[2]}
              attachments={item.images}
              size={600}
            />
            {item.images.length > 3 && (
              <MoreAttachment>+ {item.images.length - 3} more</MoreAttachment>
            )}
          </div>
        </>
      );
    };

    const renderEventInfo = () => {
      const { eventData } = item;

      return (
        <EventInfo>
          <div>
            <Icon icon="wallclock" />
            {dayjs(eventData.startDate).format('MM/DD/YYYY h:mm A')} ~{' '}
            {dayjs(eventData.endDate).format('MM/DD/YYYY h:mm A')}
          </div>
          <div>
            <Icon icon="users" />
            <b>{eventData.goingUserIds.length}</b> Going •{' '}
            <b>{eventData.interestedUserIds.length}</b> Interested
          </div>
          <div>
            <Icon icon="user" />
            Event by{' '}
            {item.createdUser.details?.fullName ||
              item.createdUser.username ||
              item.createdUser.email}
          </div>
          <div>
            <Icon icon="location-point" />
            {eventData.where}
          </div>
        </EventInfo>
      );
    };

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
              src={getUserAvatar(createdUser, 60)}
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
          <FeedActions showPin={item.isPinned}>
            <Icon icon="map-pin-alt" size={18} />
            {currentUser._id === createdUser._id && (
              <NavItem>
                <Dropdown alignRight={true}>
                  <Dropdown.Toggle as={DropdownToggle} id="comment-settings">
                    <Icon icon="ellipsis-h" size={14} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <li>
                      <Icon icon="edit" size={15} />
                      {editItem(item)}
                    </li>
                    <li>
                      <Icon icon="trash" size={15} />
                      <a onClick={() => deleteItem(item._id)}>Delete</a>
                    </li>
                    <li>
                      <Icon icon="map-pin-alt" size={15} />
                      <a onClick={() => pinItem(item._id)}>
                        {item.isPinned ? 'UnPin' : 'Pin'}
                      </a>
                    </li>
                  </Dropdown.Menu>
                </Dropdown>
              </NavItem>
            )}
          </FeedActions>
        </HeaderFeed>
        <TextFeed>
          <b dangerouslySetInnerHTML={{ __html: item.title }} />
          <p dangerouslySetInnerHTML={{ __html: updatedDescription }} />
          {item.contentType === 'event' && renderEventInfo()}
          {links.map((link, index) => {
            return (
              <iframe
                key={index}
                width="640"
                height="390"
                src={String(link)
                  .replace('watch?v=', 'embed/')
                  .replace('youtu.be/', 'youtube.com/embed/')
                  .replace('share/', 'embed/')}
                title="Video"
                allowFullScreen={true}
              />
            );
          })}
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
        {item.images.length > 0 && (
          <AttachmentContainer attachmentLength={item.images.length}>
            {renderImages()}
          </AttachmentContainer>
        )}
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
            content={props => <Comments contentId={item._id} {...props} />}
          />
          {/* <b>Share</b> */}
        </LikeCommentShare>
      </div>
    );
  };

  const renderList = () => {
    const datas = list || [];
    let pinnedList;
    let normalList;

    if (contentType === 'event') {
      pinnedList = datas.filter(
        data =>
          data.isPinned &&
          ((data.eventData?.visibility === 'private' &&
            data.recipientIds.includes(currentUser._id)) ||
            data.eventData?.visibility === 'public')
      );
      normalList = datas.filter(
        data =>
          !data.isPinned &&
          ((data.eventData?.visibility === 'private' &&
            data.recipientIds.includes(currentUser._id)) ||
            data.eventData?.visibility === 'public')
      );
    } else {
      pinnedList = datas.filter(data => data.isPinned);
      normalList = datas.filter(data => !data.isPinned);
    }

    const showList = items => {
      return items.map(filteredItem => renderItem(filteredItem));
    };

    const handleIntersection = inView => {
      if (inView && list.length !== totalCount) {
        loadMore();
      }
    };

    return (
      <>
        {showList(pinnedList)}
        {showList(normalList)}
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

const WithCurrentUser = withCurrentUser(List);

export default (props: Props) => {
  return <WithCurrentUser {...props} />;
};
