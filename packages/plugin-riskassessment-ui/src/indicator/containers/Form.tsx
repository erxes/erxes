import * as compose from "lodash.flowright";

import { Alert, ButtonMutate, Spinner } from "@erxes/ui/src";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { mutations, queries } from "../graphql";

import FormCompnent from "../components/Form";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { refetchQueries } from "../common/utils";
import { withProps } from "@erxes/ui/src/utils/core";
import { useNavigate } from "react-router-dom";

type Props = {
  _id?: string;
  queryParams: any;
};

type FinalProps = {
  indicatorDetail: any;
  duplicateMutation: any;
} & Props;

const FormContainer = (props: FinalProps) => {
  const navigate = useNavigate();

  const { indicatorDetail, queryParams, duplicateMutation } = props;
  if (indicatorDetail?.loading) {
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
    let successAction = "added";

    if (object) {
      mutation = mutations.riskIndicatorUpdate;
      successAction = "updated";
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

  const duplicatIndicator = (_id) => {
    duplicateMutation({ variables: { _id } })
      .then(({ data }) => {
        const duplicatedIndicator = data?.duplicateRiskIndicator || {};
        duplicatedIndicator &&
          navigate(
            `/settings/risk-indicators/detail/${duplicatedIndicator._id}`
          );
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };
  const updatedProps = {
    ...props,
    detail: indicatorDetail?.riskIndicatorDetail,
    renderButton,
    duplicatIndicator,
    navigate
  };

  return <FormCompnent {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.indicatorDetail), {
      name: "indicatorDetail",
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: { id: _id },
        fetchPolicy: "no-cache",
      }),
    }),
    graphql<Props>(gql(mutations.duplicate), {
      name: "duplicateMutation",
    })
  )(FormContainer)
);
