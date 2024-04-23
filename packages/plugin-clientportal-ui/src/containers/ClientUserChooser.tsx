import { Alert, withProps } from "@erxes/ui/src";
import { gql } from "@apollo/client";
import * as compose from "lodash.flowright";
import React from "react";
import { graphql } from "@apollo/client/react/hoc";
import Chooser, { CommonProps } from "@erxes/ui/src/components/Chooser";

import { mutations, queries } from "../graphql";
import {
  ClientPortalConfigsQueryResponse,
  ClientPortalUsersQueryResponse,
  IClientPortalUser,
  IClientPortalUserDoc,
  ClientPortalParticipantRelationEditMutationResponse,
} from "../types";
import Select from "react-select";

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
  portalId?: string;
  setPortal: (id: string) => void;
};

type FinalProps = {
  clientPortalUsersQuery: ClientPortalUsersQueryResponse;
  clientPortalGetConfigsQuery: ClientPortalConfigsQueryResponse;
} & Props &
  ClientPortalParticipantRelationEditMutationResponse;
class ClientUserChooser extends React.Component<
  WrapperProps & FinalProps,
  { newCPuser?: IClientPortalUser; portal?: { value: string; label: string } }
> {
  constructor(props) {
    super(props);

    this.state = {
      newCPuser: undefined,
    };
  }

  resetAssociatedItem = () => {
    return this.setState({ newCPuser: undefined });
  };
  onChangePortal = (params) => {
    this.setState({ portal: params });
    this.props.setPortal(params.value);
  };
  onInputChange = () => {};
  render() {
    const {
      data,
      clientPortalUsersQuery,
      clientPortalGetConfigsQuery,
      clientPortalParticipantRelationEdit,
      search,
    } = this.props;

    const renderName = (user: IClientPortalUser) => {
      return user.phone || user.email || "Unknown";
    };

    const updatedProps = {
      ...this.props,
      data: { datas: this.props.data.users },
      search,
      clearState: () => search(""),
      title: "Client Portal User",
      renderName,
      newItem: this.state.newCPuser,
      resetAssociatedItem: this.resetAssociatedItem,
      datas: clientPortalUsersQuery.clientPortalUsers || [],
      refetchQuery: queries.clientPortalUsers,
    };
    const filtered = clientPortalGetConfigsQuery?.clientPortalGetConfigs?.map(
      (d) => ({
        label: d.name,
        value: d._id,
      })
    );
    return (
      <div>
        <Select
          placeholder={"Type to search..."}
          value={filtered?.find((o) => o.value === this.state.portal?.value)}
          onChange={this.onChangePortal}
          isLoading={false}
          onInputChange={this.onInputChange}
          options={filtered}
          isMulti={false}
          isClearable={true}
        />
        <div style={{ marginTop: 10 }}></div>

        <Chooser
          {...updatedProps}
          onSelect={(ids) => {
            const ids_ = ids.map((d) => `${d._id}`) || [];
            clientPortalParticipantRelationEdit({
              variables: {
                type: this.props.data.mainType,
                cardId: this.props.data.mainTypeId,
                cpUserIds: ids_,
                oldCpUserIds: this.props.data.users.map((d) => d._id),
              },
            })
              .then(({ data }) => {
                Alert.success("Successfully edited");
                this.props.refetch && this.props.refetch();
              })
              .catch(() => {
                Alert.error("error");
              });
          }}
        />
      </div>
    );
  }
}

const WithQuery = withProps<Props>(
  compose(
    graphql<
      Props & WrapperProps,
      ClientPortalConfigsQueryResponse,
      { perPage: number }
    >(gql(queries.getConfigs), {
      name: "clientPortalGetConfigsQuery",
      options: ({ perPage, data }) => {
        return {
          variables: {
            perPage,
            kind: data.kind,
          },
        };
      },
    }),
    graphql<
      Props & WrapperProps,
      ClientPortalUsersQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(queries.clientPortalUsers), {
      name: "clientPortalUsersQuery",
      options: ({ searchValue, perPage, portalId }) => {
        return {
          variables: {
            searchValue,
            perPage,
            cpId: portalId,
            sortField: "createdAt",
            sortDirection: -1,
          },
        };
      },
    }),
    // mutations
    graphql<{}, {}, IClientPortalUserDoc>(
      gql(mutations.clientPortalParticipantRelationEdit),
      {
        name: "clientPortalParticipantRelationEdit",
      }
    )
  )(ClientUserChooser)
);

type WrapperProps = {
  data: {
    users: IClientPortalUser[];
    kind?: string;
    mainType: string;
    mainTypeId: string;
  };
  onSelect: (datas: IClientPortalUser[]) => void;
  closeModal: () => void;
  refetch: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  {
    perPage: number;
    searchValue: string;
    portalId?: string;
  }
> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20, searchValue: "", portalId: undefined };
  }

  search = (value, loadmore) => {
    let perPage = 20;

    if (loadmore) {
      perPage = this.state.perPage + 20;
    }

    return this.setState({ perPage, searchValue: value });
  };
  setPortal = (id) => {
    this.setState({ portalId: id });
  };

  render() {
    const { searchValue, perPage, portalId } = this.state;

    return (
      <WithQuery
        {...this.props}
        search={this.search}
        portalId={portalId}
        setPortal={this.setPortal}
        searchValue={searchValue}
        perPage={perPage}
      />
    );
  }
}
