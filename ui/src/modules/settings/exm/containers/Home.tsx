import React from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from 'react-apollo';

import DumbHome from '../components/Home';
import { queries, mutations } from '../graphql';
import { Alert } from 'modules/common/utils';
import EmptyContent from 'modules/common/components/empty/EmptyContent';

type PropsWithData = {
  lastExmId: string;
};

function HomeWithData(props: PropsWithData) {
  const { data, loading } = useQuery(gql(queries.exmDetail), {
    variables: { _id: props.lastExmId }
  });
  const [addMutation] = useMutation(gql(mutations.exmsAdd));
  const [editMutation] = useMutation(gql(mutations.exmsEdit));

  if (loading) {
    return <div>...</div>;
  }

  const add = (variables: any) => {
    addMutation({ variables })
      .then(() => {
        Alert.success('Successfully added');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const edit = (variables: any) => {
    editMutation({ variables })
      .then(() => {
        Alert.success('Successfully edited');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return <DumbHome add={add} edit={edit} exm={data.exmDetail || {}} />;
}

function HomeLastExm() {
  const { data, loading } = useQuery(gql(queries.exmGetLast));

  if (loading) {
    return <div>...</div>;
  }

  if (!data.exmGetLast) {
    return <EmptyContent content={<div>Not found</div>} />;
  }

  window.location.href = `/settings/exm?_id=${data.exmGetLast._id}`;

  return null;
}

type Props = {
  queryParams: any;
};

function Home(props: Props) {
  const { queryParams } = props;

  if (!queryParams._id) {
    return <HomeLastExm />;
  }

  return <HomeWithData lastExmId={queryParams._id} />;
}

export default Home;
