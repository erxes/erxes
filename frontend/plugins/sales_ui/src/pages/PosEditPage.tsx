import { IconCashRegister } from '@tabler/icons-react';
import { Breadcrumb, Button, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import PosDelete from '~/modules/pos/components/pos-delete/PosDelete';
import { PosEdit } from '~/modules/pos/components/pos-edit';
import { usePosList } from '~/modules/pos/hooks/usePosList';
type PosListItem = ReturnType<typeof usePosList>['posList'][number];

export const PosEditPage = () => {
  const { t } = useTranslation('sales');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posList, loading } = usePosList();

  const currentPos = posList.find((pos: PosListItem) => pos._id === id);

  const handlePosChange = (posId: string) => {
    navigate(`/sales/settings/pos/${posId}`);
  };

  return (
    <div className="flex flex-col h-full">
      <PosEdit
        id={id}
        header={
          <PageHeader>
            <PageHeader.Start>
              <Breadcrumb>
                <Breadcrumb.List className="gap-2">
                  <Breadcrumb.Item>
                    <Button variant="ghost" asChild>
                      <Link to="/sales/settings/pos">
                        <IconCashRegister />
                        {t('pos')}
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
                              ? t('loading')
                              : currentPos?.name || t('select-pos')
                          }
                        />
                      </Select.Trigger>
                      <Select.Content>
                        {posList.map((pos: PosListItem) => (
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

            <PageHeader.End>
              <PosDelete posId={id} />
            </PageHeader.End>
          </PageHeader>
        }
      />
    </div>
  );
};
