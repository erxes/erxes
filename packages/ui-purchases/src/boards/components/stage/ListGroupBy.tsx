import * as routerUtils from "@erxes/ui/src/utils/router";

import {
  AddNew,
  ColumnLastChild,
  Footer,
  GroupTitle,
  Header,
  ListBody,
  ListContainer,
  ListStageFooter,
  StageTitle
} from "../../styles/stage";
import { IItem, IOptions } from "../../types";
import { useLocation, useNavigate } from "react-router-dom";

import { AddForm } from "../../containers/portable";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Icon from "@erxes/ui/src/components/Icon";
import Item from "./Item";
import ListItemRow from "./ListItemRow";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import NameCard from "@erxes/ui/src/components/nameCard/NameCard";
import React from "react";
import Table from "@erxes/ui/src/components/table";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  index: number;
  length: number;
  items: IItem[];
  itemsTotalCount: number;
  options: IOptions;
  loadMore: () => void;
  refetch: () => void;
  onAddItem: (stageId: string, item: IItem) => void;
  onRemoveItem: (itemId: string, stageId: string) => void;
  groupObj: any;
  groupType: string;
};

const ListGroupBy = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom =
      Math.round(target.scrollHeight - target.scrollTop) <= target.clientHeight;

    if (bottom) {
      props.loadMore();
    }
  };

  const renderAddItemTrigger = () => {
    const { options, groupObj, onAddItem } = props;
    const addText = options.texts.addText;

    const trigger = (
      <ListStageFooter>
        <AddNew>
          <Icon icon="plus-1" />
          {__(addText)}
        </AddNew>
      </ListStageFooter>
    );

    const formProps = {
      options,
      showSelect: false,
      callback: (item: IItem) => onAddItem(groupObj._id, item),
      stageId: groupObj._id,
      aboveItemId: ""
    };

    const content = props => <AddForm {...props} {...formProps} />;

    return <ModalTrigger title={addText} trigger={trigger} content={content} />;
  };

  const onClick = (item: any) => {
    const { groupObj } = props;

    routerUtils.setParams(navigate, location, {
      itemId: `${item._id}${groupObj._id}`,
      key: ""
    });
  };

  const beforePopupClose = () => {
    props.refetch();
  };

  const renderHeader = () => {
    const { groupType, groupObj } = props;

    if (groupType === "assignee") {
      return <NameCard user={groupObj} avatarSize={30} />;
    }

    return (
      <GroupTitle>
        {groupObj.name.charAt(0).toUpperCase() + groupObj.name.slice(1)}
        <span>{props.itemsTotalCount}</span>
      </GroupTitle>
    );
  };

  const renderTable = () => {
    const { groupObj, items, options, groupType } = props;

    if (!groupObj) {
      return <EmptyState icon="grid" text="No stage" size="small" />;
    }

    if (!items || items.length === 0) {
      return <EmptyState icon="grid" text="No item" size="small" />;
    }

    return (
      <>
        <Table $hover={true} $bordered={true}>
          <thead>
            <tr>
              <th>{__("Card Title")}</th>
              <th>{groupType === "stage" ? __("Label") : __("Stage")}</th>
              {(groupType === "assignee" || groupType === "dueDate") && (
                <th>{__("Label")}</th>
              )}
              <th>{groupType === "priority" ? __("Label") : __("Priority")}</th>
              <th>{__("Due Date")}</th>
              {groupType !== "assignee" && <th>{__("Assignee")}</th>}
              {options.type === "purchase" && <th>{__("Products")}</th>}
              <th>{__("Associated Customer")}</th>
              <ColumnLastChild>{__("Associated Company")}</ColumnLastChild>
            </tr>
          </thead>
          <tbody id="groupByList">
            {items.map((item: any) => (
              <Item
                key={item._id}
                item={item}
                onClick={() => onClick(item)}
                beforePopupClose={beforePopupClose}
                options={options}
                groupType={groupType}
                groupObj={groupObj}
                itemRowComponent={ListItemRow}
              />
            ))}
          </tbody>
        </Table>
      </>
    );
  };

  const { groupType } = props;

  return (
    <ListContainer>
      <Header>
        <StageTitle>{renderHeader()}</StageTitle>
      </Header>
      <ListBody onScroll={onScroll}>{renderTable()}</ListBody>
      {groupType === "stage" && <Footer>{renderAddItemTrigger()}</Footer>}
    </ListContainer>
  );
};

export default ListGroupBy;
