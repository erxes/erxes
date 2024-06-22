import {
  Button,
  DataWithLoader,
  EmptyContent,
  Pagination,
  SortHandler,
  Table,
  Wrapper,
  __,
} from "@erxes/ui/src";

import { IPos } from "../../types";
import { Link } from "react-router-dom";
import React from "react";
import Row from "./Row";
import { Title } from "@erxes/ui-settings/src/styles";

type Props = {
  posList: IPos[];
  bulk: IPos[]; //*checkType
  isAllSelected: boolean;
  emptyBulk: () => void;
  queryParams: any;
  tagsCount: { [key: string]: number };
  toggleBulk: (target: IPos, toAdd: boolean) => void; //*checkType
  toggleAll: (bulk: IPos[], name: string) => void; //*checkType
  loading: boolean;
  totalCount: number;
  remove: (posId: string) => void;
  refetch?: () => void;
  counts: any; //*checkType
};

const List = (props: Props) => {
  const {
    posList,
    queryParams,
    loading,
    totalCount,
    remove,
    bulk,
    toggleBulk,
    toggleAll,
  } = props;

  queryParams.loadingMainQuery = loading;

  const onChange = () => {
    toggleAll(posList, "posList");
  };

  const renderRow = () => {
    return posList.map((pos) => (
      <Row
        key={pos._id}
        isChecked={bulk.includes(pos)}
        toggleBulk={toggleBulk}
        pos={pos}
        remove={remove}
      />
    ));
  };

  const renderActionBar = () => {
    const actionBarLeft = <Title>{__("Pos")}</Title>;

    const actionBarRight = (
      <Link to={`/pos/create`}>
        <Button btnStyle="success" icon="plus-circle">
          Create POS
        </Button>
      </Link>
    );

    return (
      <Wrapper.ActionBar
        right={actionBarRight}
        left={actionBarLeft}
        background="colorWhite"
      />
    );
  };

  const renderContent = () => {
    return (
      <Table $whiteSpace="nowrap" $hover={true}>
        <thead>
          <tr>
            <th>
              <SortHandler sortField={"name"} label={__("Name")} />
            </th>
            <th>{__("Is Online")}</th>
            <th>{__("On Server")}</th>
            <th>{__("Branch")}</th>
            <th>{__("Department")}</th>
            <th>{__("Created by")}</th>
            <th>
              <SortHandler sortField={"createdDate"} label={__("Created at")} />
            </th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("POS")}
          breadcrumb={[
            { title: "Settings", link: "/settings" },
            { title: __("POS list") },
          ]}
          queryParams={queryParams}
        />
      }
      actionBar={renderActionBar()}
      footer={<Pagination count={totalCount} />}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={totalCount}
          emptyContent={
            <EmptyContent
              content={{
                title: __("Getting Started with erxes POS"),
                description: __("replace description text"),
                steps: [
                  {
                    title: __("Create POS"),
                    description: __("Fill out the details and create your POS"),
                    url: `/pos/create`,
                    urlText: "Create POS",
                  },
                ],
              }}
              maxItemWidth="360px"
            />
          }
        />
      }
      hasBorder={true}
      transparent={true}
    />
  );
};

export default List;
