import { useParams, Link } from 'react-router-dom';
import { Button, Breadcrumb, Select } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { IconCoins } from '@tabler/icons-react';
import { PricingEdit } from '@/pricing/edit-pricing/PricingEdit';
import { usePricing } from '@/pricing/hooks/usePricing';
import { IPricing } from '@/pricing/types';
import { useNavigate } from 'react-router-dom';

export const PricingEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pricing, loading } = usePricing();

  const currentPricing = pricing?.find((p: IPricing) => p._id === id);

  const handlePricingChange = (pricingId: string) => {
    navigate(`/settings/pricing/${pricingId}`);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-2">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/pricing">
                    <IconCoins />
                    Pricing
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Select value={id} onValueChange={handlePricingChange}>
                  <Select.Trigger className="w-[200px]">
                    <Select.Value
                      placeholder={
                        loading
                          ? 'Loading...'
                          : currentPricing?.name || 'Select Pricing'
                      }
                    />
                  </Select.Trigger>
                  <Select.Content>
                    {pricing?.map((p: IPricing) => (
                      <Select.Item key={p._id} value={p._id}>
                        {p.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>

      <PricingEdit id={id} />
    </div>
  );
};

export default PricingEditPage;
