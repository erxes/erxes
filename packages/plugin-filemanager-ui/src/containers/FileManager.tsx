import * as compose from "lodash.flowright";

import { router as routerUtils, withProps } from "@erxes/ui/src/utils";

import { AppConsumer } from "coreui/appContext";
import FileManager from "../components/FileManager";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../graphql";
import queryString from "query-string";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  currentUserId?: string;
};

type FinalProps = {
  filemanagerFolderDetailQuery?: any;
} & Props;

const generateQueryParams = (location) => {
  return queryString.parse(location.search);
};

const FileManagerContainer = (props: FinalProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const onSearch = (search: string) => {
    if (!search) {
      return routerUtils.removeParams(navigate, location, "search");
    }

    routerUtils.setParams(navigate, location, { search });
  };

  const onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(location);

    if (params[key] === values) {
      return routerUtils.removeParams(navigate, location, key);
    }

    return routerUtils.setParams(navigate, location, { [key]: values });
  };

  const { filemanagerFolderDetailQuery } = props;

  const currentFolder =
    (filemanagerFolderDetailQuery &&
      filemanagerFolderDetailQuery.filemanagerFolderDetail) ||
    {};

  const updatedProps = {
    ...props,
    currentFolder,
    onSelect,
    onSearch,
  };

  return <FileManager {...updatedProps} />;
};

const WithProps = withProps<Props>(
  compose(
    graphql<Props>(gql(queries.filemanagerFolderDetail), {
      name: "filemanagerFolderDetailQuery",
      skip: ({ queryParams }) => {
        return !queryParams._id;
      },
      options: ({ queryParams }: { queryParams: any }) => ({
        variables: {
          _id: queryParams && queryParams._id ? queryParams._id : "",
        },
      }),
    })
  )(FileManagerContainer)
);

export default (props: Props) => (
  <AppConsumer>
    {({ currentUser }) => (
      <WithProps
        {...props}
        currentUserId={(currentUser && currentUser._id) || ""}
      />
    )}
  </AppConsumer>
);
