import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { ProductSettingsBreadcrumb } from './ProductSettingsBreadcrumb';
import { ProductSettingsSidebar } from './ProductSettingsSidebar';

export function ProductsSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <SettingsHeader
        breadcrumbs={<ProductSettingsBreadcrumb />}
      ></SettingsHeader>
      <div className="flex flex-auto overflow-hidden">
        <ProductSettingsSidebar />
        {children}
      </div>
    </PageContainer>
  );
}
