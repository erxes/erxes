import { Avatar, cn } from 'erxes-ui';

export const LinkFavicon = ({
  url,
  className,
  size = 'default',
}: {
  url: string;
  className?: string;
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
}) => {
  const getGoogleFavicon = (url: string) =>
    `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=128`;

  return (
    <Avatar size={size} className={cn('rounded', className)}>
      {url && <Avatar.Image src={getGoogleFavicon(url)} />}
      <Avatar.Fallback></Avatar.Fallback>
    </Avatar>
  );
};
