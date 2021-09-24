import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import { ModalTrigger, readFile, LoadMore, getUserAvatar, __ } from 'erxes-ui';
import FilterableListStyles from 'erxes-ui/lib/components/filterableList/styles';
import Icon from 'modules/common/components/Icon';
import dayjs from 'dayjs';
import Form from '../containers/Form';
import {
  BodyFeed,
  FirstSection,
  HeaderFeed,
  NewsFeedLayout,
  TypeOfContent,
  NavItem,
  Attachments,
  AttachmentsIcon,
  AttachmentsTitle
} from '../styles';

const AvatarImg = FilterableListStyles.AvatarImg;

type Props = {
  list: any;
  totalCount: number;
  deleteItem: (_id: string) => void;
};

export default function List({ list, deleteItem, totalCount }: Props) {
  const editItem = item => {
    const trigger = (
      <span>
        <a>Edit</a>
      </span>
    );

    console.log('item: ', item);

    const content = props => {
      return <Form contentType={item.contentType} item={item} {...props} />;
    };

    return <ModalTrigger title="Edit" trigger={trigger} content={content} />;
  };

  const renderItem = (item: any, index: number) => {
    const createdUser = item.createdUser || {};

    return (
      <li key={item._id}>
        <HeaderFeed>
          <FirstSection>
            <AvatarImg
              alt={
                (createdUser &&
                  createdUser.details &&
                  createdUser.details.fullName) ||
                'author'
              }
              src={getUserAvatar(createdUser)}
            />
            <TypeOfContent>
              <b>
                {createdUser &&
                  ((createdUser.details && createdUser.details.fullName) ||
                    createdUser.username ||
                    createdUser.email)}
              </b>
              <p>
                {dayjs(item.createdAt).format("lll")} #{item.contentType}
              </p>
            </TypeOfContent>
          </FirstSection>
          <NavItem>
            <Dropdown alignRight={true}>
              <Dropdown.Toggle as={DropdownToggle} id="dropdown-user">
                <Icon icon="angle-down" size={14} />
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
        <BodyFeed>
          <b dangerouslySetInnerHTML={{ __html: item.title }} />
          <p dangerouslySetInnerHTML={{ __html: item.description }} />

          {(item.images || []).map((image, index) => {
            return (
              <img key={index} alt={image.name} src={readFile(image.url)} />
            );
          })}
          {(item.attachments || []).map((a, index) => {
            return (
              <Attachments key={index}>
                <a href={readFile(a.url)}>
                  <AttachmentsIcon>
                    <Icon icon="doc" />
                  </AttachmentsIcon>
                  <AttachmentsTitle>{a.name}</AttachmentsTitle>
                </a>
              </Attachments>
            );
          })}
        </BodyFeed>
      </li>
    );
  };

  const renderList = () => {
    return (
      <NewsFeedLayout>
        {list.map((item, index) => renderItem(item, index + 1))}
        <LoadMore perPage={20} all={totalCount} />
      </NewsFeedLayout>
    );
  };

  return <div>{renderList()}</div>;
}
