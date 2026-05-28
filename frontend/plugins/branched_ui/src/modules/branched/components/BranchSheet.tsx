import { Button, Input } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const branchFormSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  managerId: z.string().optional(),
  isActive: z.boolean().default(true),
});

type BranchFormType = z.infer<typeof branchFormSchema>;

interface BranchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchData?: Partial<BranchFormType & { _id: string }>;
  onSubmit: (data: BranchFormType) => void;
}

export const BranchSheet = ({
  open,
  onOpenChange,
  branchData,
  onSubmit,
}: BranchSheetProps) => {
  const { register, handleSubmit, reset } = useForm<BranchFormType>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: branchData?.name || '',
      address: branchData?.address || '',
      phone: branchData?.phone || '',
      email: branchData?.email || '',
      managerId: branchData?.managerId || '',
      isActive: branchData?.isActive !== undefined ? branchData?.isActive : true,
    },
  });

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={() => onOpenChange(false)}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 8,
          padding: 24,
          width: '100%',
          maxWidth: 500,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>
          {branchData?._id ? 'Edit Branch' : 'Add Branch'}
        </h2>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit(data);
            reset();
            onOpenChange(false);
          })}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Name *</label>
            <Input {...register('name')} required style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Address</label>
            <Input {...register('address')} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Phone</label>
            <Input {...register('phone')} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
            <Input {...register('email')} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Manager ID</label>
            <Input {...register('managerId')} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" {...register('isActive')} style={{ marginRight: 8 }} />
            <label>Active</label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{branchData?._id ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};