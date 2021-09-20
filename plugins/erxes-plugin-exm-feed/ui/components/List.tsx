import React from "react";
import { ModalTrigger, readFile, LoadMore, getUserAvatar, __ } from "erxes-ui";
import FilterableListStyles from "erxes-ui/lib/components/filterableList/styles";
import dayjs from "dayjs";
import Form from "../containers/Form";
import {
  BodyFeed,
  FirstSection,
  HeaderFeed,
  Hours,
  NewsFeedLayout,
  TypeOfContent,
} from "../styles";

const AvatarImg = FilterableListStyles.AvatarImg;

type Props = {
  list: any;
  totalCount: number;
  deleteItem: (_id: string) => void;
};

export default function List({ list, deleteItem, totalCount }: Props) {
  const editItem = (item) => {
    const trigger = (
      <span style={{ padding: "0 15px" }}>
        <a>Edit</a>
      </span>
    );

    const content = (props) => {
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
                "author"
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
              <p>#{item.contentType}</p>
            </TypeOfContent>
          </FirstSection>
          <Hours>{dayjs(item.createdAt).format("lll")}</Hours>
        </HeaderFeed>
        <BodyFeed>
          <b dangerouslySetInnerHTML={{ __html: item.title }} />
          <p dangerouslySetInnerHTML={{ __html: item.description }} />

          {(item.images || []).map((image, index) => {
            return (
              <img key={index} alt={image.name} src={readFile(image.url)} />
            );
          })}
          {(item.attachments || []).map((a, index) => (
            <a key={index} href={readFile(a.url)}>
              {a.name}
            </a>
          ))}
        </BodyFeed>
        {editItem(item)}
        <a onClick={() => deleteItem(item._id)}>Delete</a>
      </li>
    );
  };

  const renderList = () => {
    return (
      <NewsFeedLayout>
        <ul>{list.map((item, index) => renderItem(item, index + 1))}</ul>
        <LoadMore perPage={20} all={totalCount} />
      </NewsFeedLayout>
    );
  };

  return <div>{renderList()}</div>;
}
