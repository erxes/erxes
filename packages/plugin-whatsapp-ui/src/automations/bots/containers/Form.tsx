import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import { mutations, queries } from "../graphql";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import Spinner from "@erxes/ui/src/components/Spinner";
import FormCompnent from "../components/Form";
import { withProps } from "@erxes/ui/src/utils/core";
import * as compose from "lodash.flowright";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { useNavigate } from "react-router-dom";

type Props = {
  _id?: any;
};

type FinalProps = {
  botDetailQueryResponse: any;
} & Props;

function Form(props: FinalProps) {
  const { _id, botDetailQueryResponse } = props;
  const navigate = useNavigate();

  const { whatsappBootMessengerBot, loading } = botDetailQueryResponse || {};

  if (loading) {
    return <Spinner />;
  }

  if (!!_id && !whatsappBootMessengerBot) {
    return (
      <EmptyState
        text='Not Found'
        image='/images/actions/24.svg'
      />
    );
  }

  const returnToList = () => {
    navigate(`/settings/automations/bots`);
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    confirmationUpdate,
    object,
    callback
  }: IButtonMutateProps) => {
    let mutation = mutations.addBot;
    let successAction = "added";

    if (object) {
      mutation = mutations.updateBot;
      successAction = "updated";
    }

    const afterMutate = () => {
      if (callback) {
        callback();
      }
      returnToList();
    };

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={afterMutate}
        isSubmitted={isSubmitted}
        type='submit'
        confirmationUpdate={confirmationUpdate}
        successMessage={`You successfully ${successAction} a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
    returnToList,
    bot: whatsappBootMessengerBot
  };

  return <FormCompnent {...updatedProps} />;
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.detail), {
      name: "botDetailQueryResponse",
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: { _id }
      })
    })
  )(Form)
);
