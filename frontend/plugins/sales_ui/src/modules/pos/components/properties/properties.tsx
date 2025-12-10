import { useEffect, useState, useCallback } from 'react';
import { InfoCard, Form, Button, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { isFieldVisible } from '@/pos/constants';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
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
}

interface MoreOptionsButtonProps {
  showMore: boolean;
  onToggle: () => void;
}

const MoreOptionsButton = ({ showMore, onToggle }: MoreOptionsButtonProps) => (
  <Button
    type="button"
    variant="outline"
    className="flex gap-1 items-center text-sm"
    onClick={onToggle}
  >
    {showMore ? (
      <>
        <IconChevronUp size={16} />
        Hide more options
      </>
    ) : (
      <>
        <IconChevronDown size={16} />
        More options
      </>
    )}
  </Button>
);

const LoadingSkeleton = () => (
  <div className="overflow-y-auto p-6 space-y-6 max-h-screen">
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

const Properties: React.FC<PropertiesProps> = ({ posId, posType }) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const [showMoreFields, setShowMoreFields] = useState(false);

  const isPosType = posType === 'pos';
  const isEcomType = posType === 'ecommerce';
  const isRestaurantType = posType === 'restaurant';

  const form = useForm<FormData>({ defaultValues: DEFAULT_FORM_VALUES });
  const { control, handleSubmit, reset, watch, formState } = form;
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
    const parsed = parseInt(value, 10);
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

  const toggleMoreFields = useCallback(() => {
    setShowMoreFields((prev) => !prev);
  }, []);

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
    <div className="overflow-y-auto p-6 space-y-6 max-h-screen">
      <InfoCard title="General">
        <InfoCard.Content>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleSaveChanges)}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
                  {isFieldVisible('allowBranches', posType) && (
                    <AllowBranchesField control={control} />
                  )}
                  {isFieldVisible('posDomain', posType) && (
                    <PosDomainField control={control} />
                  )}
                  {isFieldVisible('beginNumber', posType) && (
                    <BeginNumberField control={control} />
                  )}
                </div>
              )}

              {isRestaurantType && (
                <>
                  {isFieldVisible('allowTypes', posType) && (
                    <AllowTypesField control={control} />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {isFieldVisible('chooseBranch', posType) && (
                      <BranchField control={control} />
                    )}
                  </div>
                </>
              )}

              <MoreOptionsButton
                showMore={showMoreFields}
                onToggle={toggleMoreFields}
              />

              {isPosType && showMoreFields && (
                <div className="grid grid-cols-2 gap-4">
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
                  {isFieldVisible('onServer', posType) && (
                    <OnServerField control={control} />
                  )}
                </div>
              )}

              {isEcomType && showMoreFields && (
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              )}

              {isRestaurantType && showMoreFields && (
                <div className="grid grid-cols-2 gap-4">
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
                  {isFieldVisible('onServer', posType) && (
                    <OnServerField control={control} />
                  )}
                </div>
              )}

              {formState.isDirty && (
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
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
