import React from 'react';
import Form from '../../../components/insight/goal/Form';
import { IGoalType } from '../../../../../plugin-goals-ui/src/types';
import { gql, useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../../../graphql';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ButtonMutate, __, router } from '@erxes/ui/src';

type Props = {
  goal?: IGoalType;
  history: any;
  queryParams: any;
  setShowDrawer(value: boolean): void;
  getAssociatedGoalType?: (insuranceTypeId: string) => void;
};

const FormContainer = (props: Props) => {
  const { history, setShowDrawer, getAssociatedGoalType } = props;

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
    const afterSave = (data) => {
      setShowDrawer(false);

      if (!object) {
        const { _id } = data.goalsAdd;

        console.log(_id);

        if (_id) {
          router.setParams(history, { goalId: _id });
        }
      }

      if (getAssociatedGoalType) {
        getAssociatedGoalType(data.goalsAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.goalTypesEdit : mutations.goalTypesAdd}
        variables={values}
        callback={afterSave}
        refetchQueries={['goalTypesMain']}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <Form {...updatedProps} />;
};

export default FormContainer;
