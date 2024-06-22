import * as compose from "lodash.flowright";

import {
  Alert,
  confirm,
  router as routerUtils,
  withProps,
} from "@erxes/ui/src/utils";
import {
  FilemanagerFoldersQueryResponse,
  RemoveFilemanagerFolderMutationResponse,
} from "../../types";
import { MutationVariables } from "@erxes/ui/src/types";
import { mutations, queries } from "../../graphql";
import { useLocation, useNavigate } from "react-router-dom";

import FolderList from "../../components/folder/FolderList";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

type Props = {
  queryParams: any;
};

type FinalProps = {
  filemanagerFoldersQuery: FilemanagerFoldersQueryResponse;
} & Props &
  RemoveFilemanagerFolderMutationResponse;

const FolderListContainer = (props: FinalProps) => {
  const { removeMutation, filemanagerFoldersQuery, queryParams } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const folders = filemanagerFoldersQuery.filemanagerFolders || [];

  if (folders.length > 0 && !queryParams._id) {
    routerUtils.setParams(navigate, location, { _id: folders[0]._id });
  }

  // remove action
  const remove = (folderId) => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: folderId },
      })
        .then(() => {
          Alert.success("You successfully deleted a folder.");
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    folders,
    loading: false,
    remove,
  };

  return <FolderList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FilemanagerFoldersQueryResponse>(
      gql(queries.filemanagerFoldersTree),
      {
        name: "filemanagerFoldersQuery",
        options: () => ({
          variables: { isTree: true },
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<Props, RemoveFilemanagerFolderMutationResponse, MutationVariables>(
      gql(mutations.filemanagerFolderRemove),
      {
        name: "removeMutation",
        options: () => ({
          refetchQueries: [
            {
              query: gql(queries.filemanagerFoldersTree),
              variables: {
                isTree: true,
              },
            },
          ],
        }),
      }
    )
  )(FolderListContainer)
);
