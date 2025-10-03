import { useEffect, useState } from 'react';
import { MergeSheet } from './MergeSheet';
import { ICustomer } from '@/contacts/types/customerType';
import { MergingFieldContainer } from './MergingFieldContainer';
import { MergeMap, FieldType } from './MergeMap';
import { ChoiceboxGroup, useToast } from 'erxes-ui';
import { useMergeCustomers } from '@/contacts/customers/hooks/useMergeCustomers';
import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/table-core';

interface MergeProps {
  disabled?: boolean;
  customers: ICustomer[];
  rows: Row<ICustomer>[];
}

interface FieldMapping {
  displayName: string;
  position: number;
  type: FieldType;
  parentKey?: string;
}

export const CustomersMerge = ({
  disabled = false,
  customers,
  rows,
}: MergeProps) => {
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const { mergeCustomers } = useMergeCustomers();
  const handleSave = () => {
    mergeCustomers({
      variables: {
        customerIds: customers.map((customer) => customer._id),
        customerFields: value,
      },
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        rows.forEach((row) => {
          row.toggleSelected(false);
        });
        setSheetOpen(false);
        toast({
          title: 'Success',
          variant: 'default',
        });
      },
    });
  };

  const fieldMappings: Record<string, FieldMapping> = {};
  const linkFields: Record<string, FieldMapping> = {};

  MergeMap.forEach((item, index) => {
    const key = Object.keys(item)[0];
    const config = item[key];

    fieldMappings[key] = {
      displayName: config.displayName || key,
      position: index,
      type: config.type,
    };

    if (config.children && config.type === 'links') {
      config.children.forEach((child: any) => {
        const childKey = Object.keys(child)[0];
        const childConfig = child[childKey];

        linkFields[childKey] = {
          displayName: childConfig.displayName || childKey,
          position: index,
          type: childConfig.type,
          parentKey: key,
        };
      });
    }
  });

  const cleanedCustomers = customers.map((customer) => {
    return Object.fromEntries(
      Object.entries(customer).filter(([key, value]) => {
        const hasValue = value !== '' && value !== null && value !== undefined;
        const isValidObject =
          typeof value !== 'object' ||
          (Array.isArray(value) && value.length > 0) ||
          (value !== null && Object.keys(value).length > 0);
        return key in fieldMappings && hasValue && isValidObject;
      }),
    );
  });
  const sortEntriesByMergeMap = (entries: [string, any, any][]) => {
    return [...entries].sort((a, b) => {
      const keyA = a[0].startsWith('links.') ? 'links' : a[0];
      const keyB = b[0].startsWith('links.') ? 'links' : b[0];
      const posA = fieldMappings[keyA]?.position ?? Number.MAX_SAFE_INTEGER;
      const posB = fieldMappings[keyB]?.position ?? Number.MAX_SAFE_INTEGER;
      if (
        posA === posB &&
        a[0].startsWith('links.') &&
        b[0].startsWith('links.')
      ) {
        return a[0].localeCompare(b[0]);
      }
      return posA - posB;
    });
  };

  const firstCustomerEntries = Object.entries(cleanedCustomers[0] || []);
  const secondCustomerEntries = Object.entries(cleanedCustomers[1] || []);
  const mergeCustomerEntries = (
    firstEntries: [string, any][],
    secondEntries: [string, any][],
  ) => {
    const mergedEntries: [string, any, any][] = [];
    firstEntries.forEach(([key, value]) => {
      if (key === 'links') return;
      const secondValue =
        secondEntries.find(([secondKey]) => secondKey === key)?.[1] ?? null;
      mergedEntries.push([
        key,
        value,
        secondValue !== undefined ? secondValue : value,
      ]);
    });

    secondEntries.forEach(([key, value]) => {
      if (key === 'links') return;

      if (!firstEntries.some(([firstKey]) => firstKey === key)) {
        const firstValue = firstEntries.find(([k]) => k === key)?.[1] ?? null;
        mergedEntries.push([key, firstValue, value]);
      }
    });
    const firstLinks = firstEntries.find(([key]) => key === 'links')?.[1] || {};
    const secondLinks =
      secondEntries.find(([key]) => key === 'links')?.[1] || {};
    Object.keys(linkFields).forEach((linkType) => {
      const firstLinkValue = firstLinks[linkType] || '';
      const secondLinkValue = secondLinks[linkType] || '';
      if (firstLinkValue || secondLinkValue) {
        mergedEntries.push([
          `links.${linkType}`,
          firstLinkValue,
          secondLinkValue,
        ]);
      }
    });

    return mergedEntries;
  };

  const mergedCustomerEntries = sortEntriesByMergeMap(
    mergeCustomerEntries(firstCustomerEntries, secondCustomerEntries),
  );

  const createEntryKey = (key: string, value: any): string => {
    return `${key}-${
      typeof value === 'object' ? JSON.stringify(value) : value
    }`;
  };

  const initializeValues = (entries: [string, any, any][]) => {
    const initialValues: Record<string, any> = {};
    const linkValues: Record<string, any> = {};

    entries.forEach(([originalKey, value1, value2]) => {
      if (originalKey.startsWith('links.')) {
        const linkType = originalKey.split('.')[1];
        if (value1 && !value2) {
          linkValues[linkType] = value1;
        } else if (!value1 && value2) {
          linkValues[linkType] = value2;
        } else if (value1 === value2) {
          linkValues[linkType] = value1;
        } else {
          if (value1) {
            linkValues[linkType] = value1;
          } else if (value2) {
            linkValues[linkType] = value2;
          }
        }
        return;
      }

      if (value1 && !value2) {
        initialValues[originalKey] = value1;
      } else if (!value1 && value2) {
        initialValues[originalKey] = value2;
      } else if (value1 === value2) {
        initialValues[originalKey] = value1;
      } else {
        if (value1) {
          initialValues[originalKey] = value1;
        } else if (value2) {
          initialValues[originalKey] = value2;
        }
      }
    });

    if (Object.keys(linkValues).length > 0) {
      initialValues['links'] = linkValues;
    }

    return initialValues;
  };

  const [value, setValue] = useState(() => {
    return initializeValues(mergedCustomerEntries);
  });

  useEffect(() => {
    setValue(() => {
      return initializeValues(mergedCustomerEntries);
    });
  }, [customers]);

  const handleValueChange = (newValue: any, key: string) => {
    if (key.startsWith('links.')) {
      const linkType = key.split('.')[1];
      const currentLinks = { ...(value['links'] || {}) };

      if (currentLinks[linkType] === newValue) {
        delete currentLinks[linkType];
      } else {
        currentLinks[linkType] = newValue;
      }

      setValue({
        ...value,
        links: Object.keys(currentLinks).length > 0 ? currentLinks : undefined,
      });
      return;
    }

    if (value[key] === newValue) {
      setValue({ ...value, [key]: '' });
    } else {
      setValue({ ...value, [key]: newValue });
    }
  };
  if (disabled) return <MergeSheet disabled />;
  return (
    <MergeSheet
      className="p-6 flex gap-2 h-full"
      open={sheetOpen}
      onOpenChange={setSheetOpen}
      onDiscard={() => {
        setSheetOpen(false);
      }}
      onSave={handleSave}
    >
      <div className="flex-[2] h-full flex flex-col gap-2  ">
        <div className="flex justify-between gap-2 mb-1 ">
          <span className="text-sm font-semibold text-muted-foreground w-full">
            {customers[0]?.firstName}
          </span>
          <span className="text-sm font-semibold text-muted-foreground w-full">
            {customers[1]?.firstName}
          </span>
        </div>

        {mergedCustomerEntries.map(([key, value1, value2]) => {
          if (value1 === value2) return null;
          if (value1 && !value2) return null;
          if (value2 && !value1) return null;

          if (key.startsWith('links.')) {
            const linkType = key.split('.')[1];
            const displayName = linkFields[linkType]?.displayName || linkType;

            return (
              <ChoiceboxGroup
                key={key}
                value={value['links']?.[linkType]}
                onValueChange={(newValue) => handleValueChange(newValue, key)}
                direction="row"
                className="gap-3"
              >
                {value1 !== '' ? (
                  <MergingFieldContainer
                    key={createEntryKey(linkType, value1)}
                    fieldName={displayName}
                    fieldValue={value1}
                    type="link"
                  />
                ) : (
                  <span className="w-full" />
                )}

                {value2 !== '' ? (
                  <MergingFieldContainer
                    key={createEntryKey(linkType, value2)}
                    fieldName={displayName}
                    fieldValue={value2}
                    type="link"
                  />
                ) : (
                  <span className="w-full" />
                )}
              </ChoiceboxGroup>
            );
          }
          return (
            <ChoiceboxGroup
              key={key}
              value={value[key]}
              onValueChange={(newValue) => handleValueChange(newValue, key)}
              direction="row"
              className="gap-3"
            >
              {value1 !== '' ? (
                <MergingFieldContainer
                  key={createEntryKey(key, value1)}
                  fieldName={fieldMappings[key].displayName}
                  fieldValue={value1}
                  type={fieldMappings[key].type}
                />
              ) : (
                <span className="w-full" />
              )}

              {value2 !== '' ? (
                <MergingFieldContainer
                  key={createEntryKey(key, value2)}
                  fieldName={fieldMappings[key].displayName}
                  fieldValue={value2}
                  type={fieldMappings[key].type}
                />
              ) : (
                <span className="w-full" />
              )}
            </ChoiceboxGroup>
          );
        })}
      </div>

      <div className="flex-[1.2] h-full ml-5 flex flex-col gap-2">
        <span className="text-sm font-semibold text-primary mb-1">Merge</span>

        {value ? (
          <div className="flex flex-col gap-2 ">
            {Object.entries(value).map(([key, fieldValue]) => {
              if (key === 'links' || fieldValue === '') return null;

              return (
                <ChoiceboxGroup key={key} className="flex flex-col gap-2">
                  <MergingFieldContainer
                    key={createEntryKey(key, fieldValue)}
                    fieldName={fieldMappings[key]?.displayName || key}
                    fieldValue={fieldValue}
                    type={fieldMappings[key]?.type || 'string'}
                    disabled
                  />
                </ChoiceboxGroup>
              );
            })}
            {value.links &&
              Object.entries(value.links).map(([linkType, linkValue]) => {
                if (!linkValue) return null;

                return (
                  <ChoiceboxGroup
                    key={`links.${linkType}`}
                    className="flex flex-col gap-2"
                  >
                    <MergingFieldContainer
                      key={createEntryKey(linkType, linkValue)}
                      fieldName={linkFields[linkType]?.displayName || linkType}
                      fieldValue={linkValue}
                      type="link"
                      disabled
                    />
                  </ChoiceboxGroup>
                );
              })}
          </div>
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
    </MergeSheet>
  );
};
