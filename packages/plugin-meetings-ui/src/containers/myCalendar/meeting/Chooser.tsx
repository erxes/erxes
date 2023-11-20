import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import Chooser from '@erxes/ui/src/components/Chooser';
import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  mutations as jobMutations,
  queries as jobQueries
} from '../../../graphql';
// import {
//   IJobRefer,
//   JobRefersAddMutationResponse,
//   JobRefersQueryResponse,
//   JobCategoriesQueryResponse,
// } from '../../types';
import JobForm from './Form';
import { QueryResponse } from '@erxes/ui/src/types';
import { AddMutationResponse } from '../../../types';

type Props = {
  data: { name: string; datas: [] };
  types: string[];
  categoryId: string;
  //   onChangeCategory: (categoryId: string) => void;
  closeModal: () => void;
  onSelect: () => void;
};

type FinalProps = {
  dealsQuery: QueryResponse;
} & Props;

class DealChooser extends React.Component<FinalProps, { perPage: number }> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };
  }

  search = (value: string, reload?: boolean) => {
    if (!reload) {
      this.setState({ perPage: 0 });
    }

    this.setState({ perPage: this.state.perPage + 20 }, () =>
      this.props.dealsQuery.refetch({
        types: this.props.types,
        searchValue: value,
        perPage: this.state.perPage
      })
    );
  };

  // add product
  addJob = (doc: any, callback: () => void) => {
    this.props
      .addMutation({
        variables: doc
      })
      .then(() => {
        this.props.dealsQuery.refetch();

        Alert.success('You successfully added a product or service');

        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { data, dealsQuery, onSelect } = this.props;

    const updatedProps = {
      ...this.props,
      data: { name: data.name, datas: data.datas },
      search: this.search,
      title: 'Deals',
      renderName: (job: any) => {
        return job.name;
      },
      renderForm: ({ closeModal }: { closeModal: () => void }) => <></>,
      perPage: this.state.perPage,
      add: this.addJob,
      clearState: () => this.search('', true),
      datas: dealsQuery.deals || [],
      onSelect
    };

    return <Chooser {...updatedProps} renderFilter={this.render} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      { categoryId: string; types: string[] },
      { perPage: number; categoryId: string; types: string[] }
    >(gql(jobQueries.jobRefers), {
      name: 'jobsQuery',
      options: props => ({
        variables: {
          perPage: 20,
          categoryId: props.categoryId,
          types: props.types
        },
        fetchPolicy: 'network-only'
      })
    }),

    // mutations
    graphql<{}, AddMutationResponse>(gql(jobMutations.jobRefersAdd), {
      name: 'jobRefersAdd',
      options: () => ({
        refetchQueries: [
          {
            query: gql(jobQueries.jobRefers),
            variables: { perPage: 20 }
          }
        ]
      })
    })
  )(DealChooser)
);
