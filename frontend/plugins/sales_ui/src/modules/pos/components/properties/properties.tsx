import { useEffect, useCallback, type FC, type ReactNode } from 'react';
import { InfoCard, Form, Button, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { isFieldVisible } from '@/pos/constants';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { usePosEnv } from '@/pos/hooks/usePosEnv';
import {
  NameField,
  TypeField,
  DescriptionField,
  MaxSkipNumberField,
  OrderPasswordField,
  BranchField,
  DepartmentField,
  BrandField,
  OnServerField,
  IsOnlineField,
  AllowBranchesField,
  PosDomainField,
  BeginNumberField,
  AllowTypesField,
  FormData,
} from '@/pos/components/properties/PropertiesFields';

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
  onServer: false,
  pdomain: '',
  beginNumber: '',
};

const Properties: FC<PropertiesProps> = ({
  posId,
  posType,
  onSaveActionChange,
}) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const { posEnv } = usePosEnv();
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  const isPosType = posType === 'pos';
  const isEcomType = posType === 'ecommerce';
  const isRestaurantType = posType === 'restaurant';
  const showOnServerField = !posEnv?.ALL_AUTO_INIT;

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
        onServer: posDetail.onServer || false,
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
                {isFieldVisible('name', posType) && (
                  <NameField control={control} />
                )}

                <TypeField control={control} />

                {isPosType && isFieldVisible('chooseBranch', posType) && (
                  <BranchField control={control} />
                )}

                {isEcomType && isFieldVisible('isOnline', posType) && (
                  <IsOnlineField control={control} />
                )}
              </div>

              {isEcomType && isOnline && (
                <>
                  {isFieldVisible('allowBranches', posType) && (
                    <AllowBranchesField control={control} />
                  )}
                  {isFieldVisible('posDomain', posType) && (
                    <PosDomainField control={control} />
                  )}
                  {isFieldVisible('beginNumber', posType) && (
                    <BeginNumberField control={control} />
                  )}
                </>
              )}

              {isRestaurantType && (
                <>
                  {isFieldVisible('allowTypes', posType) && (
                    <AllowTypesField control={control} />
                  )}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {isFieldVisible('chooseBranch', posType) && (
                      <BranchField control={control} />
                    )}
                  </div>
                </>
              )}

              {isPosType && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {isFieldVisible('description', posType) && (
                    <DescriptionField control={control} />
                  )}
                  {isFieldVisible('maxSkipNumber', posType) && (
                    <MaxSkipNumberField control={control} />
                  )}
                  {isFieldVisible('orderPassword', posType) && (
                    <OrderPasswordField control={control} />
                  )}
                  {isFieldVisible('chooseDepartment', posType) && (
                    <DepartmentField control={control} />
                  )}
                  {showOnServerField && <OnServerField control={control} />}
                </div>
              )}

              {isEcomType && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {isFieldVisible('description', posType) && (
                    <DescriptionField control={control} />
                  )}
                  {isFieldVisible('brand', posType) && (
                    <BrandField control={control} />
                  )}
                  {isFieldVisible('chooseBranch', posType) && (
                    <BranchField control={control} />
                  )}
                  {isFieldVisible('chooseDepartment', posType) && (
                    <DepartmentField control={control} />
                  )}
                  {showOnServerField && <OnServerField control={control} />}
                </div>
              )}

              {isRestaurantType && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {isFieldVisible('description', posType) && (
                    <DescriptionField control={control} />
                  )}
                  {isFieldVisible('maxSkipNumber', posType) && (
                    <MaxSkipNumberField control={control} />
                  )}
                  {isFieldVisible('orderPassword', posType) && (
                    <OrderPasswordField control={control} />
                  )}
                  {isFieldVisible('brand', posType) && (
                    <BrandField control={control} />
                  )}
                  {isFieldVisible('chooseDepartment', posType) && (
                    <DepartmentField control={control} />
                  )}
                  {showOnServerField && <OnServerField control={control} />}
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
