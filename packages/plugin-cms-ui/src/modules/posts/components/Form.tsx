import { IField } from '@erxes/ui-segments/src/types';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { ILocationOption } from '@erxes/ui/src/types';
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
import { Button } from '@erxes/ui/src/components';

type Props = {
  post?: IPost;
  fields?: IField[];
};

const PostForm = (props: Props) => {
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

  const breadcrumb = [
    {
      title: __('Post'),
      link: '/cms/posts',
    },
  ];

  const content = (
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
  );

  const renderTitle = () => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: '10px',
          width: '50%',
        }}
      >
        <Icon icon='pen-1' />

        <FormControl
          hideBottomBorder={true}
          inline={true}
          name={'post_title'}
          type={'input'}
          required={true}
          placeholder='Post title'
          value={post.title || ''}
          onChange={(e: any) => {
            setPost({ ...post, title: e.target.value });
          }}
        />
      </div>
    );
  };

  const actionBarRight = (
    <Button btnStyle='success' size='small' icon='check' onClick={() => {}}>
      Save
    </Button>
  );

  const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

  return (
    <Wrapper
      header={<Wrapper.Header title={'name'} breadcrumb={breadcrumb} />}
      mainHead={renderTitle()}
      actionBar={actionBar}
      leftSidebar={<LeftSideBar post={post} onChange={onChange} />}
      // rightSidebar={<RightSidebar trip={trip} />}
      content={content}
      transparent={true}
    />
  );
};

export default PostForm;
