import { Navigate, useLocation, useParams } from 'react-router-dom';

/**
 * Plugin settings moved into each plugin's own app
 * (`/<plugin>/settings/…`). Old `/settings/<plugin>/…` links — bookmarks,
 * emails, notifications — land here and keep their sub-path and query.
 */
export const PluginSettingsRedirect = ({
  pluginPath,
}: {
  pluginPath: string;
}) => {
  const { '*': rest = '' } = useParams();
  const { search, hash } = useLocation();
  const subPath = rest ? `/${rest}` : '';

  return (
    <Navigate
      to={`/${pluginPath}/settings${subPath}${search}${hash}`}
      replace
    />
  );
};
