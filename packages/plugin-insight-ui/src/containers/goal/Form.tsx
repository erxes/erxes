import React from "react";

import { gql, useQuery } from "@apollo/client";

import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils/index";

import Form from "../../components/goal/Form";
import { queries, mutations } from "../../graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;

  goalId?: string;

  closeDrawer: () => void;
  getAssociatedGoalType?: (insuranceTypeId: string) => void;
};

const FormContainer = (props: Props) => {
  const { goalId, closeDrawer, getAssociatedGoalType } = props;
  const navigate = useNavigate();

  const goalQuery = useQuery(gql(queries.goalTypesDetail), {
    skip: !goalId,
    variables: {
      id: goalId,
    },
  });

  const branchListQuery = useQuery(gql(queries.branchesMain), {
    variables: { withoutUserFilter: true },
  });
  const unitListQuery = useQuery(gql(queries.unitsMain), {
    variables: { withoutUserFilter: true },
  });
  const departmentListQuery = useQuery(gql(queries.departmentsMain), {
    variables: { withoutUserFilter: true },
  });

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data, actionType) => {
      closeDrawer();
      const goalId = data[actionType]._id;

      if (goalId) {
        navigate(`/insight?goalId=${goalId}`);
      }

      if (getAssociatedGoalType) {
        getAssociatedGoalType(data[actionType]);
      }
    };

    const mutation = object ? mutations.goalTypesEdit : mutations.goalTypesAdd;
    const actionType = object ? "goalsEdit" : "goalsAdd";
    const successMessage = `You successfully ${
      object ? "updated" : "added"
    } a ${name}`;

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={(data) => afterSave(data, actionType)}
        refetchQueries={[
          {
            query: gql(queries.goalTypesMain),
          },
          {
            query: gql(queries.goalTypesDetail),
            skip: !props.goalId,
            variables: {
              id: props.goalId,
            },
          },
        ]}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={successMessage}
      >
        {__("Save")}
      </ButtonMutate>
    );
  };

  const goal = goalQuery?.data?.goalDetail;
  const loading = goalQuery.loading;

  const updatedProps = {
    ...props,
    goal,
    loading,
    renderButton,
  };

  return <Form {...updatedProps} />;
};

export default FormContainer;
