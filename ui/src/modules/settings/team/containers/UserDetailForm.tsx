import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import {
  SkillsExcludeUserMutationResponse,
  SkillsQueryResponse
} from 'modules/settings/skills/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { Alert, confirm, withProps } from '../../../common/utils';
import { queries as channelQueries } from '../../channels/graphql';
import { ChannelsQueryResponse } from '../../channels/types';
import UserDetailForm from '../components/detail/UserDetailForm';
import { mutations, queries } from '../graphql';
import {
  UserConverationsQueryResponse,
  UserDetailQueryResponse
} from '../types';
import UserForm from './UserForm';

type Props = {
  _id: string;
  queryParams: any;
  userExcludeSkill: (params: {
    variables: { _id: string; memberIds: string[] };
  }) => Promise<void>;
  renderEditForm?: ({
    closeModal,
    user
  }: {
    closeModal: () => void;
    user: IUser;
  }) => React.ReactNode;
};

type FinalProps = {
  userDetailQuery: UserDetailQueryResponse;
  channelsQuery: ChannelsQueryResponse;
  userConversationsQuery: UserConverationsQueryResponse;
  skillsQuery: SkillsQueryResponse;
};

const UserDetailFormContainer = (props: Props & FinalProps) => {
  const {
    userDetailQuery,
    channelsQuery,
    userConversationsQuery,
    skillsQuery,
    userExcludeSkill,
    renderEditForm
  } = props;

  const excludeUserSkill = (skillId: string, userId: string) => {
    confirm().then(() => {
      userExcludeSkill({ variables: { _id: skillId, memberIds: [userId] } })
        .then(() => {
          Alert.success('Successfully removed from the skill.');

          skillsQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  if (userDetailQuery.loading) {
    return <Spinner />;
  }

  const { list = [], totalCount = 0 } =
    userConversationsQuery.userConversations || {};

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const afterMutate = () => {
      userDetailQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={mutations.usersEdit}
        variables={values}
        callback={afterMutate}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        uppercase={false}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const editForm = localProps => {
    return (
      <UserForm
        {...localProps}
        closeModal={localProps.closeModal}
        object={localProps.user}
        renderButton={renderButton}
      />
    );
  };

  const updatedProps = {
    renderEditForm: renderEditForm ? renderEditForm : editForm,
    user: userDetailQuery.userDetail || {},
    participatedConversations: list,
    totalConversationCount: totalCount,
    channels: channelsQuery.channels || [],
    skills: skillsQuery.skills || [],
    excludeUserSkill
  };

  return <UserDetailForm {...updatedProps} />;
};

const commonOptions = ({ _id }: { _id: string }) => ({
  variables: { _id }
});

export default withProps<Props>(
  compose(
    graphql<Props, UserDetailQueryResponse, { _id: string }>(
      gql(queries.userDetail),
      {
        name: 'userDetailQuery',
        options: ({ _id }) => ({
          variables: { _id }
        })
      }
    ),
    graphql<
      Props,
      UserConverationsQueryResponse,
      { _id: string; perPage: number }
    >(gql(queries.userConversations), {
      name: 'userConversationsQuery',
      options: ({ _id, queryParams }) => ({
        variables: {
          _id,
          perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
        }
      })
    }),
    graphql(gql(channelQueries.channels), {
      name: 'channelsQuery',
      options: commonOptions
    }),
    graphql<Props, SkillsQueryResponse>(gql(queries.userSkills), {
      name: 'skillsQuery',
      options: ({ _id }: { _id: string }) => ({
        notifyOnNetworkStatusChange: true,
        variables: { memberIds: [_id] }
      })
    }),
    graphql<Props, SkillsExcludeUserMutationResponse>(
      gql(mutations.userExcludeSkill),
      {
        name: 'userExcludeSkill'
      }
    )
  )(UserDetailFormContainer)
);
