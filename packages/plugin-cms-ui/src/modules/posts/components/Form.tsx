import { IField } from '@erxes/ui-segments/src/types';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import {
  IAttachment,
  IButtonMutateProps,
  ILocationOption,
} from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { RichTextEditor } from '@erxes/ui/src/components/richTextEditor/TEditor';
import LeftSideBar from './LeftSidebar';

import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IPost } from '../../../types';
import FormControl from '@erxes/ui/src/components/form/Control';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Icon from '@erxes/ui/src/components/Icon';
import { Button, Uploader } from '@erxes/ui/src/components';
import RightSidebar from './RightSidebar';

type PostInput = {
  clientPortalId: string
  title: string
  slug: string
  content: string
  excerpt: string
  categoryIds: [string]
  featured: boolean
  status: string
  tagIds: [string]
  authorId: string
  scheduledDate: Date
  autoArchiveDate: Date
  reactions: [string]
  reactionCounts: any
  thumbnail: any
  images: [any]
  video: any
  audio: any
  documents: [any]
  attachments: [any]
  customFieldsData: any
}

type Props = {
  clientPortalId: string;
  post?: IPost;
  fields?: IField[];
  onSubmit: (doc: any) => void;
};

const PostForm = (props: Props) => {
  const { clientPortalId } = props;
  const defaultPost: IPost = {
    _id: `temporaryId_${Math.random().toString(36).substr(2, 9)}`,
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    categoryIds: [],
    tagIds: [],
    status: 'draft',
    authorId: '',
    featured: false,
    featuredDate: null,
    scheduledDate: new Date(),
    autoArchiveDate: new Date(),
    publishedDate: new Date(),
    viewCount: 0,
    reactions: [],
    reactionCounts: {},
    thumbnail: undefined,
    images: [],
    video: undefined,
    audio: undefined,
    documents: [],
    attachments: [],
    customFieldsData: {},
  };

  const [post, setPost] = React.useState<IPost>(
    React.useMemo(() => props.post || defaultPost, [props.post])
  );

  const onChange = (field: string, value: any) => {
    setPost({ ...post, [field]: value });
  };

  const onChangeImage = (images: IAttachment[]) => {
    if (images && images.length > 0) {
      setPost({ ...post, thumbnail: images[0] });
    }
  };

  const breadcrumb = [
    {
      title: __('Post'),
      link: '/cms/posts',
    },
  ];

  const content = (
    <>
      <FormGroup>
        <ControlLabel>{__('Featured image')}</ControlLabel>
        <Uploader
          text='Select featured image'
          accept='image/x-png,image/jpeg'
          defaultFileList={post.thumbnail ? [post.thumbnail] : []}
          onChange={onChangeImage}
          single={true}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel required={true}>{__('Content')}</ControlLabel>
        <RichTextEditor
          content={post.content || ''}
          onChange={(e) => {
            console.log(e);
          }}
          // isSubmitted={false}
          height={`vh-100`}
          name={`post_${post ? post._id : 'create'}`}
        />
      </FormGroup>
    </>
  );

  const renderHeader = () => {
    const title = `Title: ${post.title}`;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between', // Ensures space between title and button
          marginLeft: '10px',
          width: '100%',
          height: 50,
        }}
      >
        <h5 style={{ margin: 0 }}>{post.title ? title : __('New post')}</h5>
        <Button
          btnStyle='success'
          size='small'
          icon='check'
          onClick={() => {

            const doc: PostInput = {
              ...post as any,
              clientPortalId
            };
    
            
            props.onSubmit(doc);
          }}
        >
          Save
        </Button>
      </div>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={'name'} breadcrumb={breadcrumb} />}
      mainHead={renderHeader()}
      // actionBar={}
      leftSidebar={
        <LeftSideBar
          post={post}
          onChange={onChange}
          clientPortalId={clientPortalId}
        />
      }
      // rightSidebar={
      //   <RightSidebar
      //     post={post}
      //     onChange={onChange}
      //     clientPortalId={clientPortalId}
      //   />
      // }
      content={content}
      transparent={true}
    />
  );
};

export default PostForm;
