import React from "react";
import { ModalTrigger, getUserAvatar, __ } from "erxes-ui";
import FilterableListStyles from "erxes-ui/lib/components/filterableList/styles";
import dayjs from "dayjs";
import ThankForm from "../containers/ThankForm";
import { HeaderFeed, NavItem, NewsFeedLayout, TextFeed } from "../styles";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownToggle from "modules/common/components/DropdownToggle";
import Icon from "modules/common/components/Icon";
import LoadMore from "modules/common/components/LoadMore";

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
  limit,
}: Props) {
  const editItem = (item) => {
    const trigger = (
      <span>
        <a>Edit</a>
      </span>
    );

    const content = (props) => {
      return <ThankForm queryParams={queryParams} item={item} {...props} />;
    };

    return <ModalTrigger title="Edit" trigger={trigger} content={content} />;
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
              "author"
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
              <Icon icon="angle-right" size={14} />{" "}
              {item.recipients[0].username}
            </b>
            <p>
              {dayjs(item.createdAt).format("lll")} <b>#{__("ThankYou")}</b>
            </p>
          </div>
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
        <TextFeed>{item.description}</TextFeed>
      </div>
    );
  };

  return (
    <NewsFeedLayout>
      {list.map((item) => renderItem(item))}
      <LoadMore perPage={limit} all={totalCount} />
    </NewsFeedLayout>
  );
}
