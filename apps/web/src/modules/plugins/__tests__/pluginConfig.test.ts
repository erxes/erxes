import { expect, it, vi } from 'vite-plus/test';
import { parsePluginConfig } from '../pluginConfig';

const slot = () => null;

const tab = { value: 'orders', label: 'Orders', icon: slot, component: slot };

const service = {
  contentType: 'pms:service',
  title: 'Service',
  icon: slot,
  detailPath: (id: string) => `/pms/services/${id}`,
  Title: slot,
  Detail: slot,
  tabs: [
    tab,
    { ...tab, value: 'notes', after: 'activity', expandedOnly: false },
    { ...tab, value: 'description', after: 'detail', expandedOnly: true },
  ],
};

const parseRecords = (recordTypes: unknown[]) =>
  parsePluginConfig('pms_ui', { name: 'pms', path: 'pms', recordTypes })?.recordTypes;

it('preserves each tab’s visibility and placement', () => {
  expect(parseRecords([service])).toEqual([service]);
});

it.each([
  ['a non-boolean visibility flag', { expandedOnly: 'false' }],
  ['an unknown placement', { after: 'notes' }],
  ['an empty value', { value: '' }],
  ['an empty label', { label: '' }],
  ['a missing icon', { icon: null }],
  ['a string in place of a component', { component: 'orders' }],
])('skips only the record whose tab has %s', (_case, invalidFields) => {
  using errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);

  const invalid = {
    ...service,
    contentType: 'pms:invalid',
    tabs: [{ ...tab, ...invalidFields }],
  };

  expect(parseRecords([invalid, service])).toEqual([service]);
  expect(errors).toHaveBeenCalledOnce();
});
