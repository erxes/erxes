import gql from 'graphql-tag';
import { IItem, IOptions } from 'modules/boards/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { renderWithProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import AddForm from '../components/AddForm';
import { mutations, queries } from '../graphql';
import { ChecklistsQueryResponse, IChecklistsParam } from '../types';

type IProps = {
  item: IItem;
  options: IOptions;
  afterSave: () => void;
};

type FinalProps = {
  checklistsQuery: ChecklistsQueryResponse;
} & IProps;

class AddFormContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      const callBackResponse = () => {
        this.props.checklistsQuery.refetch();

        if (callback) {
          callback();
        }
      };

      return (
        <ButtonMutate
          mutation={mutations.checklistsAdd}
          variables={values}
          callback={callBackResponse}
          isSubmitted={isSubmitted}
          btnSize="small"
          type="submit"
          successMessage={`Success`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <AddForm {...updatedProps} />;
  }
}

export default (props: IProps) => {
  return renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, ChecklistsQueryResponse, IChecklistsParam>(
        gql(queries.checklists),
        {
          name: 'checklistsQuery',
          options: () => ({
            variables: {
              contentType: props.options.type,
              contentTypeId: props.item._id
            },
            refetchQueries: ['checklists']
          })
        }
      )
    )(AddFormContainer)
  );
};
