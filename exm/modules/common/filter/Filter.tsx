// import { removeParams, setParams } from "../../utils/router";

import Chip from "../Chip";
import React from "react";
import { __ } from "../../../utils";
import { cleanIntegrationKind } from "../../utils";
import createChipText from "./createChipText";
import gql from "graphql-tag";
import styled from "styled-components";

type IProps = {
  queryParams?: any;
};

const Filters = styled.div`
  font-size: 0.9em;
`;

function Filter({ queryParams = {} }: IProps) {
  // const onClickClose = (paramKey) => {
  //   for (const key of paramKey) {
  //     removeParams(history, key);
  //   }
  // };

  // const onClickRemove = (paramKey: string, ids: string[], id: string) => {
  //   if (ids.length === 1) {
  //     removeParams(history, paramKey);
  //   } else {
  //     const index = ids.indexOf(id);

  //     ids.splice(index, 1);

  //     setParams(history, { [paramKey]: ids.toString() });
  //   }
  // };

  const renderFilterParam = (
    paramKey: string,
    bool: boolean,
    customText?: string
  ) => {
    if (!queryParams[paramKey]) {
      return null;
    }

    // const onClick = () => onClickClose([paramKey]);

    const text = customText || paramKey;

    return (
      <Chip capitalize={true} onClick={() => null}>
        {bool ? text : __(cleanIntegrationKind(queryParams[paramKey]))}
      </Chip>
    );
  };

  const renderFilterWithData = (
    paramKey: string,
    type: string,
    fields = "_id name"
  ) => {
    if (queryParams[paramKey]) {
      const id = queryParams[paramKey];

      let graphqlQuery = gql`
          query ${type}Detail($id: String!) {
            ${type}Detail(_id: $id) {
              ${fields}
            }
          }
        `;

      if (type === "forum") {
        graphqlQuery = gql`
          query ForumCategoryDetail($id: ID!) {
            forumCategory(_id: $id) {
              _id
              name
            }
          }
        `;
      }

      const ids = id.split(",");

      if (ids.length > 1) {
        return ids.map((_id: string) => {
          const ChipText1 = createChipText(graphqlQuery, _id);

          return (
            <Chip
              // onClick={onClickRemove.bind(null, paramKey, ids, _id)}
              key={_id}
            >
              <ChipText1 />
            </Chip>
          );
        });
      }

      const ChipText = createChipText(graphqlQuery, id);

      return (
        <Chip
        // onClick={onClickClose.bind(null, [paramKey])}
        >
          <ChipText />
        </Chip>
      );
    }

    return null;
  };

  const renderFilterWithDate = () => {
    if (queryParams.startDate && queryParams.endDate) {
      // const onClick = () => onClickClose(["startDate", "endDate"]);

      return (
        <Chip
        // onClick={onClick}
        >
          {queryParams.startDate} - {queryParams.endDate}
        </Chip>
      );
    }

    return null;
  };

  return (
    <Filters>
      {renderFilterWithData("channelId", "channel")}
      {renderFilterParam("status", false)}
      {renderFilterParam("state", false)}
      {renderFilterParam("categoryApprovalState", false)}
      {renderFilterWithData("categoryId", "forum")}
      {renderFilterParam("participating", true)}
      {renderFilterParam("unassigned", true)}
      {renderFilterParam("awaitingResponse", true, "Awaiting Response")}
      {renderFilterWithData("brandId", "brand")}
      {renderFilterParam("integrationType", false)}
      {renderFilterParam("departmentId", true, "Department")}
      {renderFilterParam("unitId", true, "Unit")}
      {renderFilterParam("branchId", true, "Branch")}
      {renderFilterWithData("tag", "tag")}
      {renderFilterWithData("segment", "segment")}
      {renderFilterParam("segmentData", true, "Temporary segment")}
      {renderFilterParam("kind", false)}
      {renderFilterWithData("brand", "brand")}
      {renderFilterWithDate()}
      {renderFilterWithData("form", "form", "_id title")}
    </Filters>
  );
}

export default Filter;
