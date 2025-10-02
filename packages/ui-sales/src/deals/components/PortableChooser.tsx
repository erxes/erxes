import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";

import PortableChooser from "../../boards/components/portable/Chooser";
import { IItem } from "../../boards/types";
import options from "../options";

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  mainTypeName?: string;
  trigger?: React.ReactNode;
  onChoose: (item: IItem) => void;
};

export default (props: IProps) => {
  const { mainType, mainTypeId } = props;

  const [filterVariables, setFilterVariables] = useState({});
  const [perPage, setPerPage] = useState(10);

  const variables: any = {
    mainType,
    mainTypeId,
    relType: "deal",
    noSkipArchive: true,
    sortField: "createdAt",
    sortDirection: 1,

    ...filterVariables,
  };

  const { data, loading, fetchMore } = useQuery(
    gql(options.queries.itemsQuery),
    {
      variables: variables,
    }
  );

  const onLoadMore = () => {
    setPerPage(perPage + 10);

    fetchMore({
      variables: {
        skip: perPage,
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (
          !fetchMoreResult ||
          fetchMoreResult?.[options.queriesName.itemsQuery]?.length === 0
        ) {
          return prevResult;
        }

        const prevItems = prevResult?.[options.queriesName.itemsQuery] || [];
        const prevItemIds = prevItems.map((item) => item._id);

        const fetchedItems: any[] = [];

        for (const item of fetchMoreResult?.[options.queriesName.itemsQuery]) {
          if (!prevItemIds.includes(item._id)) {
            fetchedItems.push(item);
          }
        }

        return {
          ...prevResult,
          [options.queriesName.itemsQuery]: [...prevItems, ...fetchedItems],
        };
      },
    });
  };

  const onFilter = (variables: any) => {
    setPerPage(10);

    setFilterVariables((prevVariables) => ({
      ...prevVariables,
      ...variables,
    }));
  };

  let items = data?.[options.queriesName.itemsQuery] || [];

  const extendedProps = {
    ...props,
    options,
    items,
    variables,
    loading,
    perPage,
    onFilter,
    onLoadMore,
  };

  return <PortableChooser {...extendedProps} />;
};
