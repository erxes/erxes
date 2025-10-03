import { Badge, cn, Skeleton, TextOverflowTooltip } from 'erxes-ui';
import React from 'react';
import { IDepartment } from '../types/Department';
import { useDepartmentById } from '../hooks/useDepartmentById';

export const DepartmentBadge = React.forwardRef<
  React.ElementRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge> & {
    department?: IDepartment;
    departmentId?: string;
    renderClose?: (department: IDepartment) => React.ReactNode;
    onCompleted?: (department: IDepartment) => void;
    renderAsPlainText?: boolean;
  }
>(
  (
    {
      department,
      departmentId,
      renderClose,
      onCompleted,
      renderAsPlainText,
      ...props
    },
    ref,
  ) => {
    const { departmentDetail, loading } = useDepartmentById({
      variables: {
        id: departmentId,
      },
      skip: !!department || !departmentId,
      onCompleted: ({
        departmentDetail,
      }: {
        departmentDetail: IDepartment;
      }) => {
        onCompleted?.(departmentDetail);
      },
    });

    const departmentValue = department || departmentDetail;

    if (loading) {
      return <Skeleton className="w-8 h-4" />;
    }

    if (!departmentValue) {
      return null;
    }

    if (renderAsPlainText) {
      return <TextOverflowTooltip value={departmentValue?.title} />;
    }

    return (
      <Badge ref={ref} {...props}>
        <TextOverflowTooltip value={departmentValue?.title} />
      </Badge>
    );
  },
);
