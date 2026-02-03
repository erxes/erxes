import { Avatar } from 'erxes-ui';

export const LinkFavicon = ({ url }: { url: string }) => {
  const getGoogleFavicon = (url: string) =>
    `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=128`;

  return (
    <Avatar size="lg" className="rounded">
      {url && (
        <Avatar.Image src={getGoogleFavicon(url)} />
      )}
      <Avatar.Fallback></Avatar.Fallback>
    </Avatar>
  );
};