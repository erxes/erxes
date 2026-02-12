import { useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CmsLayout } from '../shared/CmsLayout';
import { PostsRecordTable } from './components/PostsRecordTable';

export const Posts = () => {
  const { websiteId } = useParams();
  const location = useLocation();

  // Force re-render when location changes (fixes back button issue)
  useEffect(() => {
    // This effect will run whenever the location changes
    // ensuring the component updates when browser back/forward is used
  }, [location]);

  return (
    <CmsLayout activeNav="posts">
      <PostsRecordTable clientPortalId={websiteId || ''} />
    </CmsLayout>
  );
};
