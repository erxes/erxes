import { cn } from 'erxes-ui';
import { PropsWithChildren } from 'react';

const Heading = ({
  children,
  className,
}: { className?: string } & PropsWithChildren) => {
  return (
    <h3 className={cn(className, 'font-mono text-lg text-primary uppercase')}>
      {children}
    </h3>
  );
};

export default Heading;
