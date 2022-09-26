import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import Chooser from '@erxes/ui/src/components/Chooser';
import { Alert, withProps } from '@erxes/ui/src/utils';
import JobCategoryChooser from '../../components/category/Chooser';
import {
  mutations as jobMutations,
  queries as jobQueries
} from '../../graphql';
import {
  IJobRefer,
  AddMutationResponse,
  JobRefersQueryResponse,
  JobCategoriesQueryResponse
} from '../../types';
import JobForm from './Form';

type Props = {
  data: { name: string; jobRefers: IJobRefer[] };
  types: string[];
  categoryId: string;
  onChangeCategory: (catgeoryId: string) => void;
  closeModal: () => void;
  onSelect: (jobRefers: IJobRefer[]) => void;
};

type FinalProps = {
  jobsQuery: JobRefersQueryResponse;
  jobCategoriesQuery: JobCategoriesQueryResponse;
} & Props &
  AddMutationResponse;

class JobReferChooser extends React.Component<FinalProps, { perPage: number }> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };
  }

  search = (value: string, reload?: boolean) => {
    if (!reload) {
      this.setState({ perPage: 0 });
    }

    this.setState({ perPage: this.state.perPage + 20 }, () =>
      this.props.jobsQuery.refetch({
        types: this.props.types,
        searchValue: value,
        perPage: this.state.perPage
      })
    );
  };

  // add product
  addJob = (doc: IJobRefer, callback: () => void) => {
    this.props
      .addMutation({
        variables: doc
      })
      .then(() => {
        this.props.jobsQuery.refetch();

        Alert.success('You successfully added a product or service');

        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  renderJobCategoryChooser = () => {
    const { jobCategoriesQuery, onChangeCategory } = this.props;

    return (
      <JobCategoryChooser
        categories={jobCategoriesQuery.jobCategories || []}
        onChangeCategory={onChangeCategory}
      />
    );
  };

  render() {
    const { data, jobsQuery, onSelect } = this.props;

    const updatedProps = {
      ...this.props,
      data: { name: data.name, datas: data.jobRefers },
      search: this.search,
      title: 'Job',
      renderName: (job: IJobRefer) => {
        if (job.code) {
          return job.code.concat(' - ', job.name);
        }

        return job.name;
      },
      renderForm: ({ closeModal }: { closeModal: () => void }) => (
        <JobForm closeModal={closeModal} />
      ),
      perPage: this.state.perPage,
      add: this.addJob,
      clearState: () => this.search('', true),
      datas: jobsQuery.jobRefers || [],
      onSelect
    };

    return (
      <Chooser {...updatedProps} renderFilter={this.renderJobCategoryChooser} />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<
      { categoryId: string; types: string[] },
      JobRefersQueryResponse,
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
    graphql<{}, JobCategoriesQueryResponse, {}>(gql(jobQueries.jobCategories), {
      name: 'jobCategoriesQuery'
    }),
    // mutations
    graphql<{}, AddMutationResponse, IJobRefer>(
      gql(jobMutations.jobRefersAdd),
      {
        name: 'jobRefersAdd',
        options: () => ({
          refetchQueries: [
            {
              query: gql(jobQueries.jobRefers),
              variables: { perPage: 20 }
            }
          ]
        })
      }
    )
  )(JobReferChooser)
);
