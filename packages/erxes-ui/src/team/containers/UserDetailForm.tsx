import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  UserConverationsQueryResponse,
  UserDetailQueryResponse
} from '../types';
import { useLazyQuery } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import UserDetailForm from '../components/detail/UserDetailForm';
import UserForm from './UserForm';
import UserSkillForm from '../components/detail/UserSkillForm';
import { gql } from '@apollo/client';
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
  channelsQuery: any; //check - ChannelsQueryResponse
  userConversationsQuery: UserConverationsQueryResponse;
  skillsQuery: any; //check - SkillsQueryResponse
  skillTypesQuery: any; //check - SkillTypesQueryResponse
  userExcludeSkill: (params: {
    variables: { _id: string; memberIds: string[] };
  }) => Promise<void>;
};

const UserDetailFormContainer = (props: Props & FinalProps) => {
  const {
    userDetailQuery,
    channelsQuery = {} as any, //check - ChannelsQueryResponse
    userConversationsQuery,
    skillsQuery = {} as any, // check - SkillsQueryResponse
    skillTypesQuery = {} as any, //check - SkillTypesQueryResponse
    userExcludeSkill,
    renderEditForm
  } = props;
  const [
    getSkills,
    { loading, data = {} as any } //check - SkillsQueryResponse
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
    excludeUserSkill,
    renderButton
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
    graphql(gql(queries.channels), {
      name: 'channelsQuery',
      options: commonOptions,
      skip: !isEnabled('inbox')
    }),
    graphql<Props, any>(gql(queries.userSkills), {
      //check - SkillsQueryResponse
      name: 'skillsQuery',
      options: ({ _id }: { _id: string }) => ({
        variables: { memberIds: [_id] }
      }),
      skip: !isEnabled('inbox')
    }),
    graphql<Props, any>(gql(queries.skillTypes), {
      //check - SkillTypesQueryResponse
      name: 'skillTypesQuery',
      skip: !isEnabled('inbox')
    }),
    graphql<Props, any>(gql(mutations.userExcludeSkill), {
      //check - SkillsExcludeUserMutationResponse
      name: 'userExcludeSkill'
    })
  )(UserDetailFormContainer)
);
