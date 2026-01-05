import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Breadcrumb, Select } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { IconCashRegister } from '@tabler/icons-react';
import { PosEdit } from '~/modules/pos/components/pos-edit';
import { usePosList } from '~/modules/pos/hooks/usePosList';
import { IPos } from '~/modules/pos/types/pos';

export const PosEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posList, loading } = usePosList();

  const currentPos = posList.find((pos: IPos) => pos._id === id);

  const handlePosChange = (posId: string) => {
    navigate(`/settings/pos/${posId}`);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-2">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/pos">
                    <IconCashRegister />
                    POS
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Select value={id} onValueChange={handlePosChange}>
                  <Select.Trigger className="w-[200px]">
                    <Select.Value
                      placeholder={
                        loading
                          ? 'Loading...'
                          : currentPos?.name || 'Select POS'
                      }
                    />
                  </Select.Trigger>
                  <Select.Content>
                    {posList.map((pos: IPos) => (
                      <Select.Item key={pos._id} value={pos._id}>
                        {pos.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>

      <PosEdit id={id} />
    </div>
  );
};
