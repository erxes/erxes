import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import routerUtils from 'modules/common/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { getWarningMessage } from '../../boards/constants';
import Groups from '../components/Groups';
import { mutations, queries } from '../graphql';
import { GroupsQueryResponse, RemoveGroupMutationResponse } from '../types';

type Props = {
  history?: any;
  currentGroupId: string;
};

type FinalProps = {
  groupsQuery: GroupsQueryResponse;
} & Props &
  IRouterProps &
  RemoveGroupMutationResponse;

class GroupsContainer extends React.Component<FinalProps> {
  render() {
    const { history, groupsQuery, removeMutation } = this.props;

    const groups = groupsQuery.calendarGroups || [];

    const removeHash = () => {
      const { location } = history;

      if (location.hash.includes('showGroupModal')) {
        routerUtils.removeHash(history, 'showGroupModal');
      }
    };

    // remove action
    const remove = groupId => {
      confirm(getWarningMessage('Group'), { hasDeleteConfirm: true }).then(
        () => {
          removeMutation({
            variables: { _id: groupId },
            refetchQueries: getRefetchQueries()
          })
            .then(() => {
              Alert.success('You successfully deleted a group');
            })
            .catch(error => {
              Alert.error(error.message);
            });
        }
      );
    };

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={object ? mutations.groupEdit : mutations.groupAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          beforeSubmit={removeHash}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const extendedProps = {
      ...this.props,
      groups,
      renderButton,
      remove,
      removeHash,
      loading: groupsQuery.loading
    };

    return <Groups {...extendedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['calendarGroups', 'calendarGroupGetLast'];
};

const generateOptions = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, GroupsQueryResponse, {}>(gql(queries.groups), {
      name: 'groupsQuery',
      options: () => ({
        variables: {}
      })
    }),
    graphql<Props, RemoveGroupMutationResponse, {}>(
      gql(mutations.groupRemove),
      {
        name: 'removeMutation',
        options: generateOptions()
      }
    )
  )(withRouter<FinalProps>(GroupsContainer))
);
