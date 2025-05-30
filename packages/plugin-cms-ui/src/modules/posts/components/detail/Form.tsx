import { IField } from '@erxes/ui-segments/src/types';
import { RichTextEditor } from '@erxes/ui/src/components/richTextEditor/TEditor';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IAttachment } from '@erxes/ui/src/types';
import { __, clearTypename } from '@erxes/ui/src/utils/core';
import React from 'react';
import LeftSideBar from './LeftSidebar';

import { Button } from '@erxes/ui/src/components';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  IPost,
  IPostDocument,
  IPostTranslation,
  IWebSite,
} from '../../../../types';
import RightSidebar from './RightSidebar';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';

type Props = {
  clientPortalId: string;
  website: IWebSite;
  post?: IPost;
  translations?: IPostTranslation[];
  fields?: IField[];
  onSubmit: (doc: any, translations?: IPostTranslation[]) => void;
};

const PostForm = (props: Props) => {
  const { clientPortalId, website } = props;

  const defaultPost: IPostDocument = {
    type: 'post',
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

  const [translations, setTranslations] = React.useState<IPostTranslation[]>(
    props.translations || []
  );
  const [currentLanguage, setCurrentLanguage] = React.useState(
    website.language
  );

  const onChange = (field: string, value: any) => {
    setPost((prev) => ({ ...prev, [field]: value }));
  };

  const onChangeImage = (images: IAttachment[]) => {
    if (images?.length > 0) {
      setPost((prev) => ({ ...prev, thumbnail: images[0] }));
    }
  };

  const onSave = () => {
    const doc: any = { ...post };

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

    props.onSubmit(clearTypename(doc), translations);
  };

  const breadcrumb = [
    { title: 'Websites', link: '/cms' },
    {
      title: website.name,
      link: '/cms/website/' + website._id + '/posts',
    },
    { title: 'Posts', link: '/cms/website/' + clientPortalId + '/posts' },
    { title: __('Post') },
  ];

  const renderHeader = () => {
    const title = `Title: ${post.title}`;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginLeft: '10px',
          width: '100%',
          height: 50,
        }}
      >
        <h5 style={{ margin: 0 }}>{post.title ? title : __('New post')}</h5>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tabs>
            {website.languages.length > 1 &&
              website.languages.map((language) => (
                <TabTitle
                  key={language}
                  onClick={() => setCurrentLanguage(language)}
                  className={currentLanguage === language ? 'active' : ''}
                >
                  {language}
                </TabTitle>
              ))}
          </Tabs>
          <Button btnStyle='success' size='small' icon='check' onClick={onSave}>
            {__('Save')}
          </Button>
        </div>
      </div>
    );
  };

  const content = () => {
    const paddingStyle = { padding: '10px 15px' };
  
    // Default language – edit post.content directly
    if (currentLanguage === website.language) {
      return (
        <div style={paddingStyle}>
          <FormGroup>
            <ControlLabel required={true}>{__('Content')}</ControlLabel>
            <RichTextEditor
              content={post.content || ''}
              onChange={(value) => onChange('content', value)}
              height="vh-100"
              name={`post_${props.post ? props.post._id : 'create'}`}
            />
          </FormGroup>
        </div>
      );
    }
  
    // Translated language – edit in translations array
    const translation = translations.find(t => t.language === currentLanguage);
  
    const handleTranslationChange = (value: string) => {
      setTranslations(prev => {
        const existing = prev.find(t => t.language === currentLanguage);
  
        if (existing) {
          return prev.map(t =>
            t.language === currentLanguage ? { ...t, content: value } : t
          );
        }
  
        // If not found, create a new translation
        return [
          ...prev,
          {
            language: currentLanguage,
            content: value,
            postId: '',
            title: post.title || '',
            excerpt: post.excerpt || '',
            customFieldsData: post.customFieldsData || {},
          },
        ];
      });
    };

    return (
      <div style={paddingStyle}>
        <FormGroup>
          <ControlLabel required={true}>{__('Content')}</ControlLabel>
          <RichTextEditor
            content={translation?.content || ''}
            onChange={handleTranslationChange}
            height="vh-100"
            name={`post_${currentLanguage}_translation`}
          />
        </FormGroup>
      </div>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={'Post'} breadcrumb={breadcrumb} />}
      mainHead={renderHeader()}
      leftSidebar={
        <LeftSideBar
          post={post}
          website={website}
          currentLanguage={currentLanguage}
          translations={translations}
          setTranslations={setTranslations}
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
      content={content()}
      transparent={true}
    />
  );
};

export default PostForm;
