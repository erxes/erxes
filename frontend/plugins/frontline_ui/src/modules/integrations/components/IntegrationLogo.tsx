import { cn } from 'erxes-ui';

export const IntegrationLogo = ({
  img,
  name,
  className,
}: {
  img: string;
  name: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'size-8 rounded overflow-hidden shadow-sm bg-background p-1',
        className,
      )}
    >
      <img src={img} alt={name} className="w-full h-full object-contain" />
    </div>
  );
};
