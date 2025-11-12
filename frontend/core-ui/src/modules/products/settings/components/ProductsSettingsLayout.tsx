import { PageContainer, ScrollArea } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { ProductSettingsBreadcrumb } from './ProductSettingsBreadcrumb';

export function ProductsSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<ProductSettingsBreadcrumb />} />
      <ScrollArea className="flex flex-auto overflow-hidden">
        <div className="max-w-2xl mx-auto p-6">{children}</div>
      </ScrollArea>
    </PageContainer>
  );
}
