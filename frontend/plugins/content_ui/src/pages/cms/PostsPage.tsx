import { PageContainer, PageSubHeader } from 'erxes-ui';
import { PostsRecordTable } from '~/modules/cms/posts/components/PostsRecordTable';
import { PostsHeader } from '~/modules/cms/posts/components/PostsHeader';
import { PostsAdd } from '~/modules/cms/posts/components/PostsAdd';
import { PostsSidebar } from '~/modules/cms/posts/components/PostsSidebar';
import { AddPostForm } from '~/modules/cms/posts/components/add-post-form';
import { AddPostHeaderActions } from '~/modules/cms/posts/components/add-post-form/AddPostHeaderActions';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostsFilter } from '~/modules/cms/posts/components/PostFilter';

export const PostsIndexPage = ({
  clientPortalId,
}: {
  clientPortalId: string;
}) => {
  const navigate = useNavigate();
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [formState, setFormState] = useState<any>(null);

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setShowEditForm(true);
  };

  const handleCloseEdit = () => {
    setEditingPost(null);
    setShowEditForm(false);
    setFormState(null);
    navigate('..');
  };

  const handleFormReady = (state: any) => {
    setFormState(state);
  };

  return (
    <PageContainer>
      {showEditForm ? (
        <div>
          <PostsHeader>
            {formState && (
              <AddPostHeaderActions
                form={formState.form}
                onSubmit={() =>
                  formState.form.handleSubmit(formState.onSubmit)()
                }
                creating={formState.creating}
                saving={formState.saving}
              />
            )}
          </PostsHeader>
          <AddPostForm
            websiteId={clientPortalId}
            editingPost={editingPost}
            onClose={handleCloseEdit}
            onFormReady={handleFormReady}
          />
        </div>
      ) : (
        <>
          <PostsHeader>
            <PostsAdd clientPortalId={clientPortalId} />
          </PostsHeader>
          <div className="flex overflow-hidden flex-auto">
            <PostsSidebar />
            <div className="flex overflow-hidden flex-col flex-auto w-full">
              <PostsPageContent
                clientPortalId={clientPortalId}
                onEditPost={handleEditPost}
              />
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
};
const PostsPageContent = ({
  clientPortalId,
  onEditPost,
}: {
  clientPortalId: string;
  onEditPost: (post: any) => void;
}) => {
  return (
    <div className="overflow-hidden flex-auto">
      <div className="h-full">
        <PageSubHeader>
          <PostsFilter />
        </PageSubHeader>
        <PostsRecordTable
          clientPortalId={clientPortalId}
          onEditPost={onEditPost}
        />
      </div>
    </div>
  );
};
