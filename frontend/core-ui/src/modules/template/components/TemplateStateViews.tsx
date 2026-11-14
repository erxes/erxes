import { IconAlertTriangle, IconPackage } from '@tabler/icons-react';
import { Empty, Spinner } from 'erxes-ui';
import { ReactNode } from 'react';

export const TemplateLoading = () => (
  <div className="flex flex-1 items-center justify-center p-10">
    <Spinner />
  </div>
);

export const TemplateError = ({ message }: { message: string }) => (
  <Empty>
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconAlertTriangle />
      </Empty.Media>
      <Empty.Description>{message}</Empty.Description>
    </Empty.Header>
  </Empty>
);

export const TemplateEmpty = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) => (
  <Empty>
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconPackage />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      <Empty.Description>{description}</Empty.Description>
    </Empty.Header>
    {children && <Empty.Content>{children}</Empty.Content>}
  </Empty>
);
