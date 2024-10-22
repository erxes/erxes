import React, { useState } from "react";
import { IGrantRequest } from "../../common/type";
import { DefaultWrapper } from "../../common/utils";
import {
  BarItems,
  Button,
  FormControl,
  SortHandler,
  Table,
  __,
} from "@erxes/ui/src";
import Row from "./Row";
import SideBar from "./SideBar";

type Props = {
  queryParams: any;
  list: IGrantRequest[];
  totalCount: number;
  handleRemove: (ids: string[]) => void;
};

const List: React.FC<Props> = (props) => {
  const [selectedRequests, setSelectedRequests] = useState([] as string[]);
  const { list, queryParams, handleRemove, totalCount } = props;

  const renderList = () => {
    const requestIds = list
      .map((item) => item._id)
      .filter((value): value is string => typeof value === "string");

    const handleSelectAll = () => {
      if (!!selectedRequests.length) {
        return setSelectedRequests([]);
      }

      setSelectedRequests(requestIds);
    };

    const handleSelect = (id: string) => {
      if (selectedRequests.includes(id)) {
        return setSelectedRequests(
          selectedRequests.filter((selectedId) => selectedId !== id)
        );
      }

      setSelectedRequests([...selectedRequests, id]);
    };

    const checked = selectedRequests.length === requestIds.length;

    return (
      <Table>
        <thead>
          <tr>
            <th style={{ width: 60 }}>
              <FormControl
                checked={checked}
                componentclass="checkbox"
                onChange={handleSelectAll}
              />
            </th>
            <th>{__("Type")}</th>
            <th>{__("Name")}</th>
            <th>{__("Requester")}</th>
            <th>{__("Recipients")}</th>
            <th>{__("Status")}</th>
            <th>
              <SortHandler sortField="createdAt" />
              {__("Requested at")}
            </th>
            <th>
              <SortHandler sortField="resolvedAt" />
              {__("Resolved at")}
            </th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <Row
              request={item}
              key={item._id}
              selecteRequests={selectedRequests}
              onChange={handleSelect}
            />
          ))}
        </tbody>
      </Table>
    );
  };

  const rightActionBar = (
    <BarItems>
      {!!selectedRequests?.length && queryParams?.archived !== "true" && (
        <Button
          btnStyle="danger"
          onClick={handleRemove.bind(this, selectedRequests)}
        >
          {`Remove (${selectedRequests?.length || 0})`}
        </Button>
      )}
    </BarItems>
  );

  const updatedProps = {
    title: __("List Request"),
    content: renderList(),
    rightActionBar,
    totalCount: totalCount,
    sidebar: <SideBar queryParams={queryParams} />,
  };

  return <DefaultWrapper {...updatedProps} />;
};

export default List;
