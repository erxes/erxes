import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Tip from '@erxes/ui/src/components/Tip';
import { ActivityDate } from '@erxes/ui-log/src/activityLogs/styles';
import Spinner from '@erxes/ui/src/components/Spinner';
import { QueryResponse } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import * as compose from 'lodash.flowright';
import React from 'react';
import { queries } from '../../bots/graphql';
import styled from 'styled-components';
import {
  Template,
  TemplateBox,
  TemplateBoxInfo,
  TemplateInfo,
} from '@erxes/ui-emailtemplates/src/styles';
import Icon from '@erxes/ui/src/components/Icon';
import colors from '@erxes/ui/src/styles/colors';

const PostImage = styled(TemplateBox)`
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  > div {
    width: 100%;
    height: 100%;
    display: flex
    flex-direction:column;
    align-items: center;
    justify-content:center;
    color:${colors.colorLightGray}
  }
`;

type Props = {
  botId: string;
  onSelect: (postId: string, post: any) => void;
};

type FinalProps = {
  botPostsQueryResponse: { facebookGetBotPosts: any[] } & QueryResponse;
} & Props;

function PostList({ botPostsQueryResponse, onSelect }: FinalProps) {
  const { facebookGetBotPosts, loading } = botPostsQueryResponse;

  if (loading) {
    return <Spinner objective />;
  }

  return (facebookGetBotPosts || []).map((post) => (
    <Template key={post.id} onClick={() => onSelect(post.id, post)}>
      <PostImage>
        {post?.full_picture ? (
          <img src={post?.full_picture} />
        ) : (
          <div>
            <Icon icon="picture" size={36} />
            <span>{'No Image'}</span>
          </div>
        )}
      </PostImage>
      <TemplateBoxInfo>
        <h5>{post.message}</h5>
        <div>
          <TemplateInfo>
            <p>{`Created at`}</p>
            <Tip text={dayjs(post?.created_time || '').format('llll')}>
              <ActivityDate>
                {dayjs(post?.created_time || '').format('MMM D, h:mm A')}
              </ActivityDate>
            </Tip>
          </TemplateInfo>
        </div>
      </TemplateBoxInfo>
    </Template>
  ));
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.getPosts), {
      name: 'botPostsQueryResponse',
      skip: ({ botId }) => !botId,
      options: ({ botId }) => ({
        variables: { botId },
      }),
    }),
  )(PostList),
);
