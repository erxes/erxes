import { Alert, ButtonMutate, EmptyState, Spinner } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import FormComponent from '../components/Form';
import { mutations, queries } from '../graphql';
import { refetchQueries } from './List';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  _id: string;
  queryParams: any;
  history: any;
  sync: any;
  closeModal: () => void;
};

type FinalProps = {
  detailQueryResponse: any;
  saveConfigMutation: any;
} & Props;

class Form extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      closeModal,
      history,
      detailQueryResponse,
      saveConfigMutation
    } = this.props;

    if (detailQueryResponse?.loading) {
      return <Spinner />;
    }

    if (!detailQueryResponse && detailQueryResponse?.error) {
      return <EmptyState image="/images/actions/24.svg" text="Not Found" />;
    }

    const saveConfig = (_id, config) => {
      saveConfigMutation({ variables: { _id, config } })
        .then(() => Alert.success('Config saved successfully'))
        .catch(error => Alert.error(error.message));
    };

    const renderButton = ({
      text,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const afterMutate = data => {
        callback && callback();
        if (!object && data?.addSaasSync) {
          const newData = data?.addSaasSync;
          history.push(`/settings/sync-saas/edit/${newData._id}`);
        }
      };
      return (
        <ButtonMutate
          mutation={object ? mutations.edit : mutations.add}
          variables={values}
          callback={afterMutate}
          refetchQueries={refetchQueries(this.props.queryParams)}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${text}`}
        />
      );
    };

    const updateProps = {
      renderButton,
      detail: detailQueryResponse?.SyncedSaasDetail,
      closeModal,
      saveConfig
    };

    return <FormComponent {...updateProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.detail), {
      name: 'detailQueryResponse',
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: { _id }
      })
    }),
    graphql<Props>(gql(mutations.saveConfig), {
      name: 'saveConfigMutation'
    })
  )(Form)
);
