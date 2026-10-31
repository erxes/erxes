import { IconPlus } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { CategoriesDelete } from '@/products/product-category/components/product-command-bar/delete/CategoryDelete';
import { useState } from 'react';
import { Can, useSidePanel } from 'ui-modules';
import { CoreTemplatePanel } from '@/templates/components/CoreTemplatePanel';
import { getModulePanelPath } from '@/side-panel/states/modulePanelState';
import { PRODUCT_CATEGORY_CREATE_PANEL } from '@/products/product-category/constants/categoryPanel';
import { useTranslation } from 'react-i18next';

export const CategoryCommandBar = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });
  const { table } = RecordTable.useRecordTable();
  const { openPath } = useSidePanel();
  const [refreshKey, setRefreshKey] = useState(0);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCategories = selectedRows.map((row) => row.original);

  const resetSelection = () => {
    table.resetRowSelection(true);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <CommandBar key={refreshKey} open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected', { count: selectedRows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <CategoriesDelete
          categories={selectedCategories}
          onDeleteSuccess={resetSelection}
        />
        <Separator.Inline />
        <Can action="productCategoriesManage">
          <Button
            variant="secondary"
            onClick={() =>
              openPath(getModulePanelPath(PRODUCT_CATEGORY_CREATE_PANEL))
            }
          >
            <IconPlus />
            {t('create')}
          </Button>
        </Can>

        <Separator.Inline />
        <CoreTemplatePanel
          contentType="core:product:productCategory"
          contentId={selectedCategories[0]?._id}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
