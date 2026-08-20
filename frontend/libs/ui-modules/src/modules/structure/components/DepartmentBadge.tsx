import { Badge, Skeleton, TextOverflowTooltip } from 'erxes-ui';
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
    showMissingId?: boolean;
  }
>(
  (
    {
      department,
      departmentId,
      renderClose,
      onCompleted,
      renderAsPlainText,
      showMissingId,
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
      if (showMissingId && departmentId) {
        if (renderAsPlainText) {
          return <TextOverflowTooltip value={departmentId} />;
        }

        return (
          <Badge
            ref={ref}
            variant="secondary"
            className="font-mono"
            title={`Unknown id: ${departmentId}`}
            onClose={props.onClose}
          >
            <span className="max-w-24 truncate">{departmentId}</span>
          </Badge>
        );
      }

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
