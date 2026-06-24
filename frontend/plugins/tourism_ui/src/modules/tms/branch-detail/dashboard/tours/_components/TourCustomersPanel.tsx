'use client';

import { Button, Card, Separator, Spinner, Tooltip } from 'erxes-ui';
import { IconMail, IconPhone, IconUser, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomersInline } from 'ui-modules';
import { useTourCustomers } from '../hooks/useTourOrders';

export const TourCustomersPanel = ({ tourId }: { tourId: string }) => {
  const { t } = useTranslation('tourism');
  const navigate = useNavigate();
  const { customerIds, customers, loading, refetch } = useTourCustomers(tourId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!customerIds.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
        <IconUsers className="w-8 h-8 text-muted-foreground" />

        <h3 className="text-base font-semibold">{t('no-customers-yet')}</h3>

        <p className="max-w-xs text-sm text-muted-foreground">
          {t('no-customers-yet-desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          {t('customers-count', { count: customerIds.length })}
        </span>

        <Button
          variant="outline"
          size="sm"
          className="px-2 text-xs h-7"
          onClick={() => refetch()}
        >
          {t('refresh')}
        </Button>
      </div>

      {customers.map((customer) => (
        <CustomersInline.Provider
          key={customer._id}
          customers={[customer]}
          customerIds={[customer._id]}
        >
          <Card className="overflow-hidden bg-background">
            <div className="p-3 space-y-3">
              <div className="flex items-center gap-3">
                <CustomersInline.Avatar size="xl" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    <CustomersInline.Title />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2 text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <IconPhone className="w-4 h-4" />
                    {t('phone')}
                  </span>
                  <span className="text-foreground">
                    {customer.primaryPhone || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <IconMail className="w-4 h-4" />
                    {t('email')}
                  </span>
                  <Tooltip.Provider>
                    <Tooltip>
                      <Tooltip.Trigger asChild>
                        <span className="truncate max-w-40 text-foreground">
                          {customer.primaryEmail || '-'}
                        </span>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        {customer.primaryEmail || '-'}
                      </Tooltip.Content>
                    </Tooltip>
                  </Tooltip.Provider>
                </div>
              </div>
            </div>

            <Separator />

            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="justify-between w-full"
                onClick={() =>
                  navigate(`/contacts/customers?contactId=${customer._id}`)
                }
              >
                {t('view-customer')}
                <IconUser className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </CustomersInline.Provider>
      ))}
    </div>
  );
};
