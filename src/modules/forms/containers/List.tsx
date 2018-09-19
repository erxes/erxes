import gql from "graphql-tag";
import { Bulk, Spinner } from "modules/common/components";
import * as React from "react";
import { compose, graphql } from "react-apollo";
import { List } from "../components";
import { mutations, queries } from "../graphql";

type Props = {
  integrationsTotalCountQuery: any;
  integrationsQuery: any;
  tagsQuery: any;
  removeMutation: ({ variables }) => Promise<void>;
  queryParams: any;
};

class ListContainer extends React.Component<Props, {}> {
  render() {
    const {
      integrationsQuery,
      integrationsTotalCountQuery,
      tagsQuery,
      removeMutation
    } = this.props;

    if (integrationsQuery.loading || integrationsTotalCountQuery.loading) {
      return <Spinner />;
    }

    const counts = integrationsTotalCountQuery.integrationsTotalCount;
    const totalCount = counts.byKind.form || 0;
    const tagsCount = counts.byTag || {};

    const integrations = integrationsQuery.integrations || [];

    const remove = (_id, callback) => {
      removeMutation({
        variables: { _id }
      }).then(() => {
        // refresh queries
        integrationsQuery.refetch();
        integrationsTotalCountQuery.refetch();

        callback();
      });
    };

    const updatedProps = {
      ...this.props,
      integrations,
      remove,
      loading: integrationsQuery.loading,
      totalCount,
      tagsCount,
      tags: tagsQuery.tags || []
    };

    return (
      <Bulk
        content={props => {
          return <List {...updatedProps} {...props} />;
        }}
        refetch={() => {
          this.props.integrationsQuery.refetch();
          this.props.integrationsTotalCountQuery.refetch();
        }}
      />
    );
  }
}

export default compose(
  graphql<Props>(gql(queries.integrations), {
    name: "integrationsQuery",
    options: ({ queryParams }) => {
      return {
        variables: {
          page: queryParams.page,
          perPage: queryParams.perPage || 20,
          tag: queryParams.tag,
          kind: "form"
        },
        fetchPolicy: "network-only"
      };
    }
  }),
  graphql(gql(queries.integrationsTotalCount), {
    name: "integrationsTotalCountQuery",
    options: () => ({
      fetchPolicy: "network-only"
    })
  }),
  graphql(gql(queries.tags), {
    name: "tagsQuery",
    options: () => ({
      variables: {
        type: "integration"
      },
      fetchPolicy: "network-only"
    })
  }),
  graphql(gql(mutations.integrationRemove), {
    name: "removeMutation"
  })
)(ListContainer);
