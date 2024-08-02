import Row from "./Row";
import { __, Pagination } from "@erxes/ui/src";
import React from "react";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import Table from "@erxes/ui/src/components/table";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";

type Props = {
  burenCustomerScorings: any;
  totalCount: number;
  loading: boolean;
};

function List({ burenCustomerScorings, loading, totalCount }: Props) {
  const content = (
    <Table $whiteSpace="nowrap" $bordered={true} $hover={true} $striped>
      <thead>
        <tr>
          <th>{__("Регистер")}</th>
          <th>{__("Оноо")}</th>
          <th>{__("Зорилго")}</th>
          <th>{__("Өдөр")}</th>
          <th>{__("Дэлгэрэнгүй")}</th>
        </tr>
      </thead>
      <tbody id={"BurenscoringsShowing"}>
        {burenCustomerScorings.map((burenScoring) => {
          return <Row key={burenScoring._id} burenScoring={burenScoring} />;
        })}
      </tbody>
    </Table>
  );
  const breadcrumb = [
    { title: __("Scoring"), link: "/Burenscoring" },
    { title: __("Burenscorings"), link: "/burenscorings" },
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("Burenscorings")} breadcrumb={breadcrumb} />
      }
      footer={<Pagination count={totalCount || 0} />}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={burenCustomerScorings.length}
          emptyText={__("Theres no burenscoring")}
          emptyImage="/images/actions/8.svg"
        />
      }
      hasBorder
    />
  );
}

export default List;
