import { IconInfoCircle } from '@tabler/icons-react';
import { Button, cn, PageContainer, Switch, toast, Tooltip } from 'erxes-ui';
import { Slot } from 'radix-ui';
import React, { useState } from 'react';
import {
  SelectBrand,
  SelectCompany,
  SelectCustomer,
  SelectMember,
  SelectProduct,
  SelectTags,
} from 'ui-modules';

interface SelectContainerProps {
  children: React.ReactElement<{ mode?: 'single' | 'multiple' }>;
  label?: string;
  description?: string;
}

const SelectContainer = ({
  children,
  label,
  description,
}: SelectContainerProps) => {
  const [isMultipleMode, setIsMultipleMode] = useState(false);

  return (
    <div className="rounded-lg shadow-sm p-6 flex flex-col gap-4 md:max-w-68">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium text-foreground">{label}</h3>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <div>
                <Switch
                  checked={isMultipleMode}
                  onCheckedChange={setIsMultipleMode}
                />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>{isMultipleMode ? 'multiple' : 'single'} mode</p>
            </Tooltip.Content>
          </Tooltip>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="w-full">
        <Slot.Root {...{ mode: isMultipleMode ? 'multiple' : 'single' }}>
          {children}
        </Slot.Root>
      </div>
    </div>
  );
};

const SelectContainerGroup = ({
  children,
  label,
  description,
}: {
  children?: React.ReactNode;
  label: string;
  description?: string;
}) => {
  return (
    <div className="space-y-4 ">
      <div className=" border-l-4 pl-4 border-l-primary/40 flex flex-col gap-1">
        <h2 className="text-xl font-medium tracking-tight">{label}</h2>
        {description && (
          <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
            {description}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
};

export const SelectComponentIndexPage = () => {
  const [customerId, setCustomerId] = useState<string | string[]>('');
  const [productId, setProductId] = useState<string | string[]>('');
  const [memberId, setMemberId] = useState<string | string[]>('');
  const [companyId, setCompanyId] = useState<string | string[]>('');
  const [tagId, setTagId] = useState<string | string[]>('');
  const [customerTagId, setCustomerTagId] = useState<string | string[]>('');
  const [productTagId, setProductTagId] = useState<string | string[]>('');
  const [companyTagId, setCompanyTagId] = useState<string | string[]>('');
  const [brandId, setBrandId] = useState<string | string[]>('');
  return (
    <PageContainer className="overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-12">
          <div>
            <span className="flex items-center gap-2">
              <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                Select Components
              </h1>
              <Tooltip>
                <Tooltip.Trigger tabIndex={-1}>
                  <IconInfoCircle className="size-5 text-muted-foreground" />
                </Tooltip.Trigger>
                <Tooltip.Content side="bottom">
                  <p>
                    This page is only available in the development environment.
                  </p>
                </Tooltip.Content>
              </Tooltip>
            </span>
          </div>
          <SelectContainerGroup
            label="Brands"
            description="Select component for different brand types"
          >
            <SelectContainer
              label="Select brands"
              description="Choose from available brands"
            >
              <SelectBrand
                value={brandId}
                onValueChange={(value) => {
                  setBrandId(value);
                }}
              />
            </SelectContainer>
          </SelectContainerGroup>
          <SelectContainerGroup
            label="Tags"
            description="Select component for different tag types"
          >
            <SelectContainer
              label="Select tags"
              description="Choose from available tags"
            >
              <SelectTags
                tagType=""
                value={tagId}
                onValueChange={(value) => {
                  setTagId(value);
                }}
              />
            </SelectContainer>

            <SelectContainer
              label="Select company tags"
              description="Choose from available company tags"
            >
              <SelectTags
                tagType="core:company"
                value={companyTagId}
                onValueChange={(value) => {
                  setCompanyTagId(value);
                }}
              />
            </SelectContainer>
            <SelectContainer
              label="Select product tags"
              description="Choose from available product tags"
            >
              <SelectTags
                tagType="core:product"
                value={productTagId}
                onValueChange={(value) => {
                  setProductTagId(value);
                }}
              />
            </SelectContainer>
            <SelectContainer
              label="Select customer tags"
              description="Choose from available customer tags"
            >
              <SelectTags
                tagType="core:customer"
                value={customerTagId}
                onValueChange={(value) => {
                  setCustomerTagId(value);
                }}
              />
            </SelectContainer>
          </SelectContainerGroup>
          <SelectContainerGroup
            label="Contact"
            description="Components for managing contacts"
          >
            <SelectContainer
              label="Company Select"
              description="Search and select companies"
            >
              <SelectCompany value={companyId} onValueChange={setCompanyId} />
            </SelectContainer>
            <SelectContainer
              label="Customer Select"
              description="Search and select customers"
            >
              <SelectCustomer
                value={customerId}
                onValueChange={setCustomerId}
              />
            </SelectContainer>
          </SelectContainerGroup>
          <SelectContainerGroup
            label="Team"
            description="Components for managing team members"
          >
            <SelectContainer
              label="Member Select"
              description="Select team members"
            >
              <SelectMember
                value={memberId}
                onValueChange={(value) => {
                  setMemberId(value as string);
                }}
              />
            </SelectContainer>
            {/* <SelectContainer
              label="Branch Select"
              description="Browse and select branches"
            >
              <SelectBranches value={branchId} onValueChange={setBranchId} />
            </SelectContainer> */}
          </SelectContainerGroup>
          <SelectContainerGroup
            label="Content"
            description="Components for managing content and products"
          >
            <SelectContainer
              label="Product Select"
              description="Browse and select products"
            >
              <SelectProduct value={productId} onValueChange={setProductId} />
            </SelectContainer>
            <SelectContainer
              label="Product Select"
              description="Browse and select products"
            >
              <SelectProduct value={productId} onValueChange={setProductId} />
            </SelectContainer>
          </SelectContainerGroup>
        </div>
        <div className="py-12">
          <div className="rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium tracking-tight pb-4">Colors</h2>
            <div className="grid grid-cols-12 gap-2 w-full">
              {[
                'bg-primary',
                'bg-secondary',
                'bg-destructive',
                'bg-success',
                'bg-warning',
                'bg-info',
              ].map((className, index) => (
                <div
                  className={cn(
                    'col-span-1 aspect-square rounded font-mono text-xs  p-2 uppercase',
                    className,
                  )}
                >
                  // {className.split('bg-')[1]}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-12 gap-2 w-full mt-4">
              {[
                'bg-background',
                'bg-sidebar',
                'bg-accent',
                'bg-muted',
                'bg-border',
                'bg-scroll',
                'bg-muted-foreground',
                'bg-accent-foreground',
              ].map((className) => (
                <div
                  className={cn(
                    'col-span-1 aspect-square rounded font-mono text-xs  p-2 uppercase shadow-xs',
                    className,
                  )}
                  key={className}
                >
                  {className.split('bg-')[1]}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-12 gap-2 w-full mt-4 dark">
              {[
                'bg-background',
                'bg-sidebar',
                'bg-accent',
                'bg-muted',
                'bg-border',
                'bg-scroll',
                'bg-muted-foreground',
                'bg-accent-foreground',
              ].map((className) => (
                <div
                  className={cn(
                    'col-span-1 aspect-square rounded font-mono text-xs  p-2 uppercase shadow-xs',
                    className,
                  )}
                  key={className}
                >
                  {className.split('bg-')[1]}
                </div>
              ))}
            </div>
          </div>
        </div>

        <ToastExample />
      </div>
    </PageContainer>
  );
};

const ToastExample = () => {
  return (
    <div className="flex gap-2 shadow-sm p-6 rounded-lg">
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: 'Default Toast',
            description: 'This is a default toast.',
          })
        }
      >
        Show Default Toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            variant: 'success',
            title: 'Success Toast',
            description: 'This is a success toast.',
          })
        }
      >
        Show Success Toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            variant: 'warning',
            title: 'Warning Toast',
            description: 'This is a warning toast.',
          })
        }
      >
        Show Warning Toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            variant: 'destructive',
            title: 'Destructive Toast',
            description: 'This is a destructive toast.',
          })
        }
      >
        Show Destructive Toast
      </Button>
    </div>
  );
};
