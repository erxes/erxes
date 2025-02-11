import { IField } from '@erxes/ui-segments/src/types';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import {
  IAttachment,
  IButtonMutateProps,
  ILocationOption,
} from '@erxes/ui/src/types';
import { __, clearTypename } from '@erxes/ui/src/utils/core';
import React from 'react';
import { RichTextEditor } from '@erxes/ui/src/components/richTextEditor/TEditor';
import LeftSideBar from './LeftSidebar';

import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IPost, IPostDocument } from '../../../types';
import FormControl from '@erxes/ui/src/components/form/Control';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Icon from '@erxes/ui/src/components/Icon';
import { Button, Uploader } from '@erxes/ui/src/components';
import RightSidebar from './RightSidebar';

type Props = {
  clientPortalId: string;
  post?: IPost;
  fields?: IField[];
  onSubmit: (doc: any) => void;
};

const PostForm = (props: Props) => {

  const { clientPortalId } = props;
  const defaultPost: IPostDocument = {
    clientPortalId,
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
    scheduledDate: undefined,
    autoArchiveDate: undefined,
    publishedDate: undefined,
    viewCount: 0,
    reactions: [],
    reactionCounts: {},
    thumbnail: undefined,
    images: [],
    video: undefined,
    audio: undefined,
    documents: [],
    attachments: [],
    customFieldsData: [],
  };

  const [post, setPost] = React.useState<IPostDocument>(
    React.useMemo(() => props.post || defaultPost, [props.post])
  );

  const onChange = (field: string, value: any) => {
    const editedPost = { ...post };
    editedPost[field] = value;

    setPost(editedPost);
  };

  const onChangeImage = (images: IAttachment[]) => {
    if (images && images.length > 0) {
      setPost({ ...post, thumbnail: images[0] });
    }
  };

  const onSave = () => {
    const doc: any = post;

    const fieldsToDelete = [
      'viewCount',
      'featuredDate',
      'publishedDate',
      'createdAt',
      'updatedAt',
      '__typename',
      'author',
      'categories',
      'tags',
      'authorKind',
      '_id',
    ];

    fieldsToDelete.forEach((field) => {
      delete doc[field];
    });

    doc.clientPortalId = clientPortalId;

    props.onSubmit(clearTypename(doc));
  };

  const breadcrumb = [
    {
      title: __('Post'),
      link: '/cms/posts',
    },
  ];

  const content = (
    <div style={{ padding: '10px 15px' }}>
      <FormGroup>
        <ControlLabel required={true}>{__('Content')}</ControlLabel>
        <RichTextEditor
          content={post.content || ''}
          onChange={(e) => {
            onChange('content', e);
          }}
          // isSubmitted={false}
          height={`vh-100`}
          name={`post_${props.post ? props.post._id : 'create'}`}
        />
      </FormGroup>
    </div>
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
        <Button btnStyle='success' size='small' icon='check' onClick={onSave}>
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
      rightSidebar={
        <RightSidebar
          post={post}
          onChange={onChange}
          clientPortalId={clientPortalId}
        />
      }
      content={content}
      transparent={true}
    />
  );
};

export default PostForm;
