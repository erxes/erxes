import { Alert, confirm } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import BulkAddFormComponent from '../components/BulkAddForm';
import { mutations } from '../graphql';
import { refetchQueries } from './SingkeAddForm';

type Props = {
  closeModal: () => void;
  cardId: string;
  cardType: string;
};

type FinalProps = {
  addBulkAssessment: any;
} & Props;

class BulkAddForm extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { addBulkAssessment, ...props } = this.props;

    const handleSave = (bulkItems: any[]) => {
      const { cardId, cardType } = this.props;

      confirm().then(() => {
        addBulkAssessment({ variables: { bulkItems, cardId, cardType } })
          .then(() => {
            Alert.success('Added successfully');
            this.props.closeModal();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const updateProps = {
      ...props,
      handleSave
    };

    return <BulkAddFormComponent {...updateProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.addBulkAssessment), {
      name: 'addBulkAssessment',
      options: ({ cardId, cardType }) => ({
        refetchQueries: refetchQueries({ cardId, cardType })
      })
    })
  )(BulkAddForm)
);
