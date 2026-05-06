import {
  AllowBranchesField,
  AllowTypesField,
  BeginNumberField,
  BranchField,
  BrandField,
  DepartmentField,
  DescriptionField,
  FormData,
  IsOnlineField,
  MaxSkipNumberField,
  NameField,
  OnServerField,
  OrderPasswordField,
  PosDomainField,
} from '@/pos/components/properties/PropertiesFields';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { usePosEnv } from '@/pos/hooks/usePosEnv';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, toast } from 'erxes-ui';
import { useCallback, useEffect, useState, type FC, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { MoreOptionsButton } from '../MoreOptionsButton';

interface PropertiesProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

const LoadingSkeleton = () => (
  <div className="p-6">
    <InfoCard title="Properties">
      <InfoCard.Content>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="w-24 h-4 rounded animate-pulse bg-muted" />
              <div className="h-8 rounded animate-pulse bg-muted" />
            </div>
          ))}
        </div>
      </InfoCard.Content>
    </InfoCard>
  </div>
);

const PROPERTIES_FORM_ID = 'pos-properties-form';

const DEFAULT_FORM_VALUES: FormData = {
  name: '',
  description: '',
  type: '',
  maxSkipNumber: '',
  orderPassword: '',
  branchId: '',
  departmentId: '',
  allowBranchIds: [],
  brandId: '',
  allowTypes: [],
  isOnline: false,
  onServer: true,
  pdomain: '',
  beginNumber: '',
};

const Properties: FC<PropertiesProps> = ({
  posId,
  posType,
  onSaveActionChange,
}) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const { posEnv } = usePosEnv()

  const [showMore, setShowMore] = useState(false);
  const toggleMore = useCallback(() => setShowMore((prev) => !prev), []);

  const form = useForm<FormData>({ defaultValues: DEFAULT_FORM_VALUES });
  const { control, handleSubmit, reset, watch, formState } = form;
  const { isDirty } = formState;
  const isOnline = watch('isOnline');

  useEffect(() => {
    if (posDetail) {
      reset({
        name: posDetail.name || '',
        description: posDetail.description || '',
        type: posDetail.type || '',
        maxSkipNumber: posDetail.maxSkipNumber?.toString() || '',
        orderPassword: posDetail.orderPassword || '',
        branchId: posDetail.branchId || '',
        departmentId: posDetail.departmentId || '',
        allowBranchIds: posDetail.allowBranchIds || [],
        brandId: posDetail.scopeBrandIds?.[0] || '',
        allowTypes: posDetail.allowTypes || [],
        isOnline: posDetail.isOnline || false,
        onServer: posDetail.onServer || true,
        pdomain: posDetail.pdomain || '',
        beginNumber: posDetail.beginNumber || '',
      });
    }
  }, [posDetail, reset]);

  const parseMaxSkipNumber = (value: string): number => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const handleSaveChanges = useCallback(
    async (data: FormData) => {
      if (!posId) {
        toast({
          title: 'Error',
          description: 'POS ID is required',
          variant: 'destructive',
        });
        return;
      }

      try {
        await posEdit({
          variables: {
            _id: posId,
            name: data.name,
            description: data.description,
            type: data.type,
            maxSkipNumber: parseMaxSkipNumber(data.maxSkipNumber),
            orderPassword: data.orderPassword,
            branchId: data.branchId,
            departmentId: data.departmentId,
            allowBranchIds: data.allowBranchIds,
            scopeBrandIds: data.brandId ? [data.brandId] : [],
            allowTypes: data.allowTypes,
            isOnline: data.isOnline,
            onServer: data.onServer,
            pdomain: data.pdomain,
            beginNumber: data.beginNumber,
          },
        });

        toast({
          title: 'Success',
          description: 'Properties saved successfully',
        });
        reset(data);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to save properties',
          variant: 'destructive',
        });
      }
    },
    [posId, posEdit, reset],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={PROPERTIES_FORM_ID}
          size="sm"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, saving]);

  if (detailLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">
          Failed to load POS details: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <InfoCard title="General configuration">
        <InfoCard.Content>
          <Form {...form}>
            <form
              id={PROPERTIES_FORM_ID}
              onSubmit={handleSubmit(handleSaveChanges)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <NameField control={control} />
                <IsOnlineField control={control} />
                <BranchField control={control} />
                <DepartmentField control={control} />
              </div>

              {isOnline ? (
                <>
                  <AllowBranchesField control={control} />
                  <PosDomainField control={control} />
                </>
              ) : (
                <AllowTypesField control={control} />
              )}

              <MoreOptionsButton showMore={showMore} onToggle={toggleMore} />

              {showMore && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <BeginNumberField control={control} />
                  <MaxSkipNumberField control={control} />
                  <OrderPasswordField control={control} />
                  <BrandField control={control} />
                  {!isOnline && [true, 'true', 'True', 1, '1'].includes(posEnv?.ALLOW_OFFLINE_POS ?? '') && (
                    <OnServerField control={control} />
                  )}
                  <DescriptionField control={control} />
                </div>
              )}
            </form>
          </Form>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default Properties;
