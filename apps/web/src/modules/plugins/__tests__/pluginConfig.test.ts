import { expect, it, vi } from 'vite-plus/test';
import { parsePluginConfig } from '../pluginConfig';

const slot = () => null;

it('preserves tab visibility and rejects a record that supplies a non-boolean flag', () => {
  const tab = { value: 'orders', label: 'Orders', icon: slot, component: slot };

  const tabs = [
    tab,
    { ...tab, value: 'notes', expandedOnly: false },
    { ...tab, value: 'description', expandedOnly: true },
  ];

  const service = {
    contentType: 'pms:service',
    title: 'Service',
    icon: slot,
    detailPath: (id: string) => `/pms/services/${id}`,
    Title: slot,
    Detail: slot,
    tabs,
  };

  using errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);

  const invalid = {
    ...service,
    contentType: 'pms:invalid',
    tabs: [{ ...tab, expandedOnly: 'false' }],
  };

  const config = parsePluginConfig('pms_ui', {
    name: 'pms',
    path: 'pms',
    recordTypes: [invalid, service],
  });

  expect(config?.recordTypes).toEqual([service]);
  expect(errors).toHaveBeenCalledOnce();
});
