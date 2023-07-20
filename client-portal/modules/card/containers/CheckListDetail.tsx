import { gql, useQuery } from "@apollo/client";
import React from "react";
import { queries } from "../graphql";
import { Config } from "../../types";
import CheckList from "../components/CheckListDetail";

type Props = {
  checklist: any;
  type: string;
  config: Config;
};
function CheckListDetail({ type, checklist, config }: Props) {
  const { data, loading: checklistDetailQueryLoading } = useQuery(
    gql(queries.checklists),
    {
      variables: { contentType: type, contentTypeId: checklist._id },
      skip: type !== "task",
      context: {
        headers: {
          "erxes-app-token": config?.erxesAppToken
        }
      }
    }
  );

  return <CheckList checklistDetail={data} />;
}

export default CheckListDetail;
