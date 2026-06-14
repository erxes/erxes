import { useAtomValue } from 'jotai';
import { webAppCredentialsUrlAtom } from '../states';

export const WebCall = () => {
  const webAppUrl = useAtomValue(webAppCredentialsUrlAtom);

  if (!webAppUrl) {
    return <div>Loading communication portal...</div>;
  }

  return (
    <iframe
      title="web-call"
      src={webAppUrl}
      sandbox="allow-scripts allow-same-origin"
      className='*:hide-scroll!'
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  );
};
