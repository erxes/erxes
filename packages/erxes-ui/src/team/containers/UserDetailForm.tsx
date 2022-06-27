import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from '@erxes/ui/src/auth/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import {
  SkillsExcludeUserMutationResponse,
  SkillsQueryResponse,
  SkillTypesQueryResponse
} from '@erxes/ui-settings/src/skills/types';
import React from 'react';
import { graphql, useLazyQuery } from 'react-apollo';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { queries as channelQueries } from '@erxes/ui-settings/src/channels/graphql';
import { ChannelsQueryResponse } from '@erxes/ui-settings/src/channels/types';
import skillQueries from '@erxes/ui-settings/src/skills/graphql/queries';
import UserDetailForm from '../components/detail/UserDetailForm';
import UserSkillForm from '../components/detail/UserSkillForm';
import { mutations, queries } from '../graphql';
import {
  UserConverationsQueryResponse,
  UserDetailQueryResponse
} from '../types';
import UserForm from './UserForm';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  _id: string;
  queryParams: any;
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
  skillTypesQuery: SkillTypesQueryResponse;
  userExcludeSkill: (params: {
    variables: { _id: string; memberIds: string[] };
  }) => Promise<void>;
};

const UserDetailFormContainer = (props: Props & FinalProps) => {
  const {
    userDetailQuery,
    channelsQuery = {} as ChannelsQueryResponse,
    userConversationsQuery,
    skillsQuery = {} as SkillsQueryResponse,
    skillTypesQuery = {} as SkillTypesQueryResponse,
    userExcludeSkill,
    renderEditForm
  } = props;
  const [
    getSkills,
    { loading, data = {} as SkillsQueryResponse }
  ] = useLazyQuery(gql(queries.userSkills), {
    fetchPolicy: 'network-only'
  } as any);

  const handleSkillTypeSelect = (typeId: string, userId: string) =>
    getSkills({ variables: { typeId, list: true, memberIds: [userId] } });

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
    (userConversationsQuery && userConversationsQuery.userConversations) || {};

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

  const renderSkillForm = formProps => {
    const refetchSkills = (id: string) => {
      return [
        { query: gql(queries.userSkills), variables: { memberIds: [id] } }
      ];
    };

    return (
      <UserSkillForm
        {...formProps}
        handleSkillTypeSelect={handleSkillTypeSelect}
        refetchSkills={refetchSkills}
        user={userDetailQuery.userDetail || {}}
        skillTypes={skillTypesQuery.skillTypes || []}
        skills={data.skills || []}
        loading={loading}
      />
    );
  };

  const updatedProps = {
    renderEditForm: renderEditForm ? renderEditForm : editForm,
    renderSkillForm,
    user: userDetailQuery.userDetail || ({} as IUser),
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
      }),
      skip: !isEnabled('inbox')
    }),
    graphql(gql(channelQueries.channels), {
      name: 'channelsQuery',
      options: commonOptions,
      skip: !isEnabled('inbox')
    }),
    graphql<Props, SkillsQueryResponse>(gql(queries.userSkills), {
      name: 'skillsQuery',
      options: ({ _id }: { _id: string }) => ({
        variables: { memberIds: [_id] }
      }),
      skip: !isEnabled('inbox')
    }),
    graphql<Props, SkillTypesQueryResponse>(gql(skillQueries.skillTypes), {
      name: 'skillTypesQuery',
      skip: !isEnabled('inbox')
    }),
    graphql<Props, SkillsExcludeUserMutationResponse>(
      gql(mutations.userExcludeSkill),
      {
        name: 'userExcludeSkill'
      }
    )
  )(UserDetailFormContainer)
);
