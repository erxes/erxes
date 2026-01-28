import {
    INSTAGRAM_GET_BOT_POST,
    INSTAGRAM_GET_BOT_POSTS,
  } from '@/integrations/instagram/graphql/queries/instagramBots';
  import { gql, useQuery } from '@apollo/client';
  import { IconImageInPicture } from '@tabler/icons-react';
  import {
    Button,
    Card,
    cn,
    Collapsible,
    RelativeDateDisplay,
    Separator,
    Spinner,
  } from 'erxes-ui';
  import { format } from 'date-fns';
  import { useState } from 'react';
  
  export const InstagramPostSelector = ({
    botId,
    selectedPostId,
    onSelect,
  }: {
    botId: string;
    selectedPostId?: string;
    onSelect: (id: string) => void;
  }) => {
    const [isOpen, setOpen] = useState(false);
  
    return (
      <Collapsible open={isOpen} onOpenChange={setOpen}>
        <Collapsible.Trigger asChild>
          <div className="w-full">
            <InstagramSelectedPost botId={botId} selectedPostId={selectedPostId} />
            <Button className="w-full mt-2">
              {isOpen
                ? 'Hide posts'
                : selectedPostId
                ? 'Change selected post'
                : 'Select post'}
            </Button>
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content className="border ">
          {isOpen && (
            <InstagramPostsList
              botId={botId}
              selectedPostId={selectedPostId}
              onSelect={onSelect}
            />
          )}
        </Collapsible.Content>
      </Collapsible>
    );
  };
  
  const InstagramSelectedPost = ({
    botId,
    selectedPostId,
  }: {
    botId: string;
    selectedPostId?: string;
  }) => {
    const { data, loading } = useQuery<{
      instagramGetBotPost: {
        id: string;
        message: string;
        created_time: string;
        full_picture: string;
        picture: string;
        permalink_url: string;
      };
    }>(INSTAGRAM_GET_BOT_POST, {
      variables: { botId, postId: selectedPostId },
      skip: !botId || !selectedPostId,
    });
  
    if (loading) {
      return <Spinner />;
    }
  
    const { instagramGetBotPost } = data || {};
  
    if (!instagramGetBotPost) {
      return null;
    }
  
    return (
      <Card className=" flex h-24 overflow-hidden">
        <div className="h-full aspect-video shrink-0 overflow-hidden">
          {instagramGetBotPost?.full_picture ? (
            <img
              src={instagramGetBotPost.full_picture}
              alt="Post"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-accent-foreground bg-muted">
              <IconImageInPicture size={24} />
              <span className="text-xs">No Image</span>
            </div>
          )}
        </div>
  
        <div className="flex flex-col justify-between p-2 w-full overflow-hidden">
          <h5 className="truncate text-sm font-medium">
            {instagramGetBotPost?.message}
          </h5>
  
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created at</span>
            <span>
              {instagramGetBotPost?.created_time
                ? format(instagramGetBotPost.created_time, 'MMM dd, yyyy HH:mm')
                : ''}
            </span>
          </div>
  
          <a
            href={instagramGetBotPost?.permalink_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            See post in Instagram
          </a>
        </div>
      </Card>
    );
  };
  
  const InstagramPostsList = ({
    botId,
    selectedPostId,
    onSelect,
  }: {
    botId: string;
    selectedPostId?: string;
    onSelect: (id: string) => void;
  }) => {
    const { data, loading } = useQuery<{
      instagramGetBotPosts: {
        id: string;
        message: string;
        created_time: string;
        full_picture: string;
        picture: string;
        permalink_url: string;
      }[];
    }>(INSTAGRAM_GET_BOT_POSTS, { variables: { botId }, skip: !botId });
  
    if (loading) {
      return <Spinner />;
    }
    const { instagramGetBotPosts = [] } = data || {};
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
        {instagramGetBotPosts.map((post) => (
          <InstagramPost
            key={post.id}
            post={post}
            isSelected={selectedPostId === post.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  };
  
  const InstagramPost = ({
    isSelected,
    onSelect,
    post,
  }: {
    isSelected?: boolean;
    onSelect: (id: string) => void;
    post: {
      id: string;
      message: string;
      created_time: string;
      full_picture: string;
      picture: string;
      permalink_url: string;
    };
  }) => {
    return (
      <Card
        className={cn('overflow-hidden', {
          'shadow-lg ring-2 border-primary ring-primary/50': isSelected,
        })}
        onClick={() => onSelect(post.id)}
      >
        <div className="aspect-video overflow-hidden">
          {post?.full_picture ? (
            <img
              src={post?.full_picture}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-accent-foreground">
              <IconImageInPicture size={36} />
              <span>{'No Image'}</span>
            </div>
          )}
        </div>
        <Separator />
        <div className="p-2">
          <h5 className="truncate text-sm font-medium">{post.message}</h5>
          <div className="flex flex-row justify-between items-center">
            <p className="text-xs text-gray-500 mb-2">Created at</p>
            <p className="text-xs text-gray-600 mb-3">
              {format(post?.created_time, 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <a
            href={post.permalink_url}
            target="_blank"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            See post in Facebook
          </a>
        </div>
      </Card>
    );
  };
  