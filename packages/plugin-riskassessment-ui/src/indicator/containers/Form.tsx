
import { Alert, ButtonMutate, Spinner } from "@erxes/ui/src";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { mutations, queries } from "../graphql";

import { gql, useMutation, useQuery } from '@apollo/client';
import React from "react";
import { useNavigate } from "react-router-dom";
import { RiskIndicatortDetailQueryResponse } from "../common/types";
import { refetchQueries } from "../common/utils";
import FormCompnent from "../components/Form";

type Props = {
  _id?: string;
  queryParams: any;
};

const FormContainer = ({ _id, queryParams }: Props) => {
  const navigate = useNavigate();

  const { data, loading } = useQuery<RiskIndicatortDetailQueryResponse>(
    gql(queries.indicatorDetail),
    {
      variables: {
        id: _id,
      },
      fetchPolicy: 'no-cache',
    }
  );

  const [duplicate] = useMutation(gql(mutations.duplicate));

  if (loading) {
    return <Spinner />;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    confirmationUpdate,
    object,
    callback,
  }: IButtonMutateProps) => {
    let mutation = mutations.riskIndicatorAdd;
    let successAction = 'added';

    if (object) {
      mutation = mutations.riskIndicatorUpdate;
      successAction = 'updated';
    }

    const afterMutate = ({ addRiskIndicator }) => {
      if (callback) {
        callback();
      }
      if (!object) {
        const newIndicator = addRiskIndicator || {};
        newIndicator &&
          navigate(`/settings/risk-indicators/detail/${newIndicator._id}`);
      }
    };

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={afterMutate}
        isSubmitted={isSubmitted}
        refetchQueries={refetchQueries(queryParams)}
        type="submit"
        confirmationUpdate={confirmationUpdate}
        successMessage={`You successfully ${successAction} a ${name}`}
      />
    );
  };

  const duplicatIndicator = _id => {
    duplicate({ variables: { _id } })
      .then(({ data }) => {
        const duplicatedIndicator = data?.duplicateRiskIndicator || {};
        duplicatedIndicator &&
          navigate(
            `/settings/risk-indicators/detail/${duplicatedIndicator._id}`
          );
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };
  const updatedProps = {
    detail: data?.riskIndicatorDetail,
    renderButton,
    duplicatIndicator,
    navigate,
  };

  return <FormCompnent {...updatedProps} />;
};

export default FormContainer