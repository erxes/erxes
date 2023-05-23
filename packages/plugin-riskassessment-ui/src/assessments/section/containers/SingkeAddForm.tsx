import { Alert, confirm } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import FormComponent from '../components/SingleAddForm';
import { mutations, queries } from '../graphql';
type Props = {
  closeModal: () => void;
  cardId: string;
  cardType: string;
  riskAssessment: any;
};

type FinalProps = {
  addRiskAssessment: any;
  editRiskAssessment: any;
  removeRiskAssessment: any;
} & Props;

class Form extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      cardId,
      cardType,
      riskAssessment,
      addRiskAssessment,
      editRiskAssessment,
      removeRiskAssessment,
      closeModal
    } = this.props;

    const handleSelect = (doc: any) => {
      if (riskAssessment && riskAssessment.status !== 'In Progress') {
        return Alert.error(
          'You cannot change this risk assessment because it has already calculated'
        );
      }

      if (riskAssessment && !doc.groupId && !doc.indicatorId) {
        return confirm().then(() => {
          removeRiskAssessment({
            variables: { riskAssessmentId: riskAssessment?._id }
          });
        });
      }
      if (riskAssessment && doc) {
        return editRiskAssessment({ variables: { ...riskAssessment, ...doc } });
      }

      addRiskAssessment({ variables: { ...doc } });
    };

    const updatedProps = {
      cardId,
      cardType,
      riskAssessment,
      closeModal,
      handleSelect
    };

    return <FormComponent {...updatedProps} />;
  }
}

export const refetchQueries = ({
  cardId,
  cardType,
  riskAssessmentId
}: {
  cardId: string;
  cardType: string;
  riskAssessmentId?: string;
}) => [
  {
    query: gql(queries.riskAssessment),
    variables: { cardId, cardType }
  },
  {
    query: gql(queries.riskAssessmentSubmitForm),
    variables: { cardId, cardType, riskAssessmentId }
  }
];

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.addRiskAssessment), {
      name: 'addRiskAssessment',
      options: ({ cardId, cardType }) => ({
        refetchQueries: refetchQueries({ cardId, cardType })
      })
    }),
    graphql<Props>(gql(mutations.editRiskAssessment), {
      name: 'editRiskAssessment',
      options: ({ cardId, cardType, riskAssessment }) => ({
        refetchQueries: refetchQueries({
          cardId,
          cardType,
          riskAssessmentId: riskAssessment?._id
        })
      })
    }),
    graphql<Props>(gql(mutations.removeRiskAssessment), {
      name: 'removeRiskAssessment',
      options: ({ cardId, cardType }) => ({
        refetchQueries: refetchQueries({ cardId, cardType })
      })
    })
  )(Form)
);
