import client from "@erxes/ui/src/apolloClient";
import { gql, useMutation, useQuery } from "@apollo/client";
import Spinner from "@erxes/ui/src/components/Spinner";
import { Alert, confirm } from "@erxes/ui/src/utils";
import { queries as userQueries } from "@erxes/ui/src/team/graphql";
import { AllUsersQueryResponse, IUser } from "@erxes/ui/src/auth/types";
import React, { useEffect } from "react";
import ErrorMsg from "@erxes/ui/src/components/ErrorMsg";
import { mutations, queries, subscriptions } from "../../graphql";
import {
  CopyMutation,
  DetailQueryResponse,
  IItem,
  IItemParams,
  IOptions,
  RemoveMutation,
  SaveMutation,
} from "../../types";
import { invalidateCache } from "../../utils";
import { PipelineConsumer } from "../PipelineContext";
import withCurrentUser from "@erxes/ui/src/auth/containers/withCurrentUser";
import { useLocation, useNavigate } from "react-router-dom";
import * as routerUtils from "@erxes/ui/src/utils/router";

type WrapperProps = {
  itemId: string;
  stageId: string;
  options?: IOptions;
  isPopupVisible: boolean;
  beforePopupClose?: () => void;
  onAdd?: (stageId: string, item: IItem, aboveItemId?: string) => void;
  onRemove?: (itemId: string, stageId: string) => void;
  onUpdate?: (item: IItem, prevStageId: string) => void;
  hideHeader?: boolean;
  currentUser: IUser;
};

type ContainerProps = {
  onAdd: (stageId: string, item: IItem, aboveItemId?: string) => void;
  onRemove: (itemId: string, stageId: string) => void;
  onUpdate: (item: IItem, prevStageId: string) => void;
  options: IOptions;
} & WrapperProps;

const EditFormContainer = (props: ContainerProps) => {
  const { options, itemId, stageId, onAdd, onRemove } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const {
    data: detailData,
    loading: detailLoading,
    error: detailError,
    refetch: refetchDetail,
    subscribeToMore,
  } = useQuery<DetailQueryResponse>(gql(options.queries.detailQuery), {
    variables: { _id: itemId },
    fetchPolicy: "network-only",
  });

  const { data: usersData, loading: usersLoading } =
    useQuery<AllUsersQueryResponse>(gql(userQueries.allUsers));

  const refetchQueries = {
    refetchQueries: [
      {
        query: gql(queries.stageDetail),
        variables: { _id: stageId },
      },
    ],
  };

  const [addMutation] = useMutation<SaveMutation>(
    gql(options.mutations.addMutation),
    refetchQueries
  );
  const [editMutation] = useMutation<SaveMutation>(
    gql(options.mutations.editMutation),
    refetchQueries
  );
  const [removeMutation] = useMutation<RemoveMutation>(
    gql(options.mutations.removeMutation),
    refetchQueries
  );
  const [copyMutation] = useMutation<CopyMutation>(
    gql(options.mutations.copyMutation),
    refetchQueries
  );

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: gql(subscriptions.pipelinesChanged),
      variables: { _id: itemId },
      updateQuery: (prev, { subscriptionData }) => {
        const { pipelinesChanged } = subscriptionData.data as any;

        if (!pipelinesChanged || !pipelinesChanged.data) {
          return prev;
        }
        const { proccessId } = pipelinesChanged;
        if (proccessId === localStorage.getItem("proccessId")) {
          return prev;
        }
        if (document.querySelectorAll(".modal").length < 2) {
          refetchDetail();
        }
        return prev;
      },
    });
    return () => unsubscribe();
  }, [itemId, refetchDetail, subscribeToMore]);

  const addItem = (doc: IItemParams, callback: () => void) => {
    addMutation({ variables: doc })
      .then(() => callback())
      .catch((error) => Alert.error(error.message));
  };

  const copyItem = (itemId: string, callback: () => void) => {
    const proccessId = Math.random().toString();
    localStorage.setItem("proccessId", proccessId);
    copyMutation({ variables: { _id: itemId, proccessId } })
      .then(({ data }) => {
        callback();
        if (onAdd && data)
          onAdd(stageId, data[options.mutationsName.copyMutation], itemId);
      })
      .catch((error) => Alert.error(error.message));
  };

  const saveItem = (doc: IItemParams, callback: (item: any) => void) => {
    const proccessId = Math.random().toString();
    localStorage.setItem("proccessId", proccessId);
    console.log("doc", doc, doc.status, "archived");
    editMutation({
      variables: {
        _id: itemId,
        ...doc,
      },
    })
      .then(({ data }) => {
        data && callback(data[options.mutationsName.editMutation]);
        invalidateCache();
        console.log(
          "if",
          doc.status !== "archived" &&
            (data || ({} as any)).tasksEdit?.pipeline._id
        );
        if (
          doc.status !== "archived" &&
          (data || ({} as any)).tasksEdit?.pipeline._id
        ) {
          console.log("inside");
          routerUtils.removeParams(navigate, location, "pipelineId");
          routerUtils.setParams(navigate, location, {
            pipelineId: (data || ({} as any)).tasksEdit?.pipeline._id,
          });
        }
      })
      .catch((error) => Alert.error(error.message));
  };

  const removeItem = (itemId: string, callback: () => void) => {
    confirm().then(() =>
      removeMutation({ variables: { _id: itemId } })
        .then(() => {
          callback();
          if (options.texts.deleteSuccessText) {
            Alert.success(options.texts.deleteSuccessText);
          }
          if (onRemove) {
            invalidateCache();
            onRemove(itemId, stageId);
          }
        })
        .catch((error) => Alert.error(error.message))
    );
  };

  const updateTimeTrack = (
    doc: { _id: string; status: string; timeSpent: number },
    callback?: () => void
  ) => {
    client
      .mutate({
        variables: { ...doc, type: options.type },
        mutation: gql(mutations.boardItemUpdateTimeTracking),
      })
      .then(() => callback && callback())
      .catch((error) => Alert.error(error.message));
  };

  if (usersLoading || detailLoading) {
    return <Spinner />;
  }

  if (detailError) {
    return <ErrorMsg>{detailError.message}</ErrorMsg>;
  }

  const users = usersData?.allUsers || [];
  const item = detailData?.[options.queriesName.detailQuery];
  console.log("item", item, props.isPopupVisible);
  if (!item) {
    return null;
  }

  const extendedProps = {
    ...props,
    item,
    addItem,
    removeItem,
    saveItem,
    copyItem,
    updateTimeTrack,
    users,
  };

  const EditForm = options.EditForm;

  return <EditForm {...extendedProps} />;
};

const WithData: React.FC<ContainerProps> = (props) => {
  return <EditFormContainer {...props} />;
};

export default withCurrentUser((props: WrapperProps) => {
  return (
    <PipelineConsumer>
      {({ onAddItem, onRemoveItem, onUpdateItem, options }) => (
        <WithData
          {...props}
          onAdd={onAddItem || props.onAdd}
          onRemove={onRemoveItem || props.onRemove}
          onUpdate={onUpdateItem || props.onUpdate}
          options={props.options || options}
        />
      )}
    </PipelineConsumer>
  );
});
