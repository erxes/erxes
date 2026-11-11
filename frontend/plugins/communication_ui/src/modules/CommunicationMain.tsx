import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { IconMessages } from '@tabler/icons-react';
import { AppLayout, NavigationMenuLinkItem, Sidebar, Spinner } from 'erxes-ui';

const MessagingPage = lazy(() =>
  import('@/messaging/components/MessagingPage').then((module) => ({
    default: module.MessagingPage,
  })),
);

const MessagingPreview =
  process.env.NODE_ENV === 'development'
    ? lazy(() =>
        import('@/messaging/preview/MessagingPreview').then((module) => ({
          default: module.MessagingPreview,
        })),
      )
    : null;

const CommunicationSidebar = () => (
  <Sidebar.Group className="px-2 py-1">
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        <NavigationMenuLinkItem
          pathPrefix="communication"
          path="messaging"
          name="Messaging"
          icon={IconMessages}
        />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);

/** The communication app: `/communication/messaging`. */
export const Communication = () => {
  const { search } = useLocation();
  const preview = new URLSearchParams(search).get('preview') === '1';

  return (
    <AppLayout
      id="communication"
      title="Communication"
      sidebar={<CommunicationSidebar />}
    >
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route index element={<Navigate to="messaging" replace />} />
          <Route
            path="messaging"
            element={
              preview && MessagingPreview ? (
                <MessagingPreview />
              ) : (
                <MessagingPage />
              )
            }
          />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};
