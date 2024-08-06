import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import From from "../../components/time/TimesForm";
import { gql, useQuery } from "@apollo/client";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";

import { IButtonMutateProps } from "@erxes/ui/src/types";
import { mutations, queries } from "../../graphql";
import { TimeframeQueryResponse } from "../../types";

type Props = {
  closeModal: () => void;
};

const TimesFormContainer = (props: Props) => {
  const timeFrameQuery = useQuery<TimeframeQueryResponse>(
    gql(queries.timeframes)
  );

  if (timeFrameQuery.loading) {
    return <Spinner />;
  }

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.timeProportionsAdd}
        variables={values}
        callback={callback}
        refetchQueries={["timeProportions", "timeProportionsCount"]}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully updated a day labels`}
      />
    );
  };

  const timeframes = timeFrameQuery?.data?.timeframes || [];

  const updatedProps = {
    ...props,
    timeframes,
    renderButton,
  };

  return <From {...updatedProps} />;
};

export default TimesFormContainer;
