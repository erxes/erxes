import { gql, useQuery } from '@apollo/client';
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
import Info from '@erxes/ui/src/components/Info';

const PostImage = styled(TemplateBox)`
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px 6px 0 0;
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
const PostsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const PostWrapper = styled(Template)`
  cursor: pointer;
`;

type Props = {
  botId: string;
  onSelect: (postId: string, post: any) => void;
};

type FinalProps = {
  botPostsQueryResponse: { instagramGetBotPosts: Post[] } & QueryResponse;
} & Props;

type Post = {
  id: string;
  full_picture?: string;
  created_time?: string;
  message: string;
  permalink_url: string;
};

function renderPost(
  post: Post,
  onSelect?: (postId: string, post: Post) => void,
) {
  return (
    <PostWrapper
      key={post.id}
      onClick={() => onSelect && onSelect(post.id, post)}
    >
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
          <a href={post.permalink_url} target="_blank">
            See post in Instagram
          </a>
        </div>
      </TemplateBoxInfo>
    </PostWrapper>
  );
}

function PostList({ botPostsQueryResponse, onSelect }: FinalProps) {
  const { instagramGetBotPosts, loading } = botPostsQueryResponse;

  if (loading) {
    return <Spinner objective />;
  }

  return (
    <PostsWrapper>
      {(instagramGetBotPosts || []).map((post) => renderPost(post, onSelect))}
    </PostsWrapper>
  );
}

export function Post({
  botId,
  postId,
  onlyLink,
}: {
  botId: string;
  postId: string;
  onlyLink?: boolean;
}) {
  const { error, loading, data } = useQuery(gql(queries.getPost), {
    variables: {
      botId,
      postId,
    },
    skip: !botId || !postId,
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return <Spinner objective />;
  }

  if (error) {
    return <Info> {error.message}</Info>;
  }

  const { instagramGetBotPost } = data;

  if (onlyLink) {
    return (
      <a href={instagramGetBotPost?.permalink_url} target="_blank">
        See post in Instagram
      </a>
    );
  }

  return renderPost((instagramGetBotPost || {}) as Post);
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
