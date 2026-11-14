import { describe, expect, it } from 'vite-plus/test';
import { derivePluginNames, validatePluginName } from '../naming';

describe('validatePluginName', () => {
  it('accepts lowercase names with single dashes, old plugin names included', () => {
    const names = ['inventory', 'erxes-agent-v2', 'crm2', 'operation', 'a'.repeat(40)];

    expect(names.filter((name) => validatePluginName(name) !== undefined)).toEqual([]);
  });

  it('rejects invalid and reserved names and names over 40 characters', () => {
    const accepted = [
      '',
      'Inventory',
      '2crm',
      'my_plugin',
      'a--b',
      'a-',
      '-a',
      'core',
      'a'.repeat(41),
    ].filter((name) => validatePluginName(name) === undefined);

    expect(accepted).toEqual([]);
  });
});

describe('derivePluginNames', () => {
  it('derives every erxes-facing name from a dashed name', () => {
    expect(derivePluginNames('erxes-agent-v2')).toEqual({
      name: 'erxes-agent-v2',
      id: 'erxes_agent_v2',
      remote: 'erxes_agent_v2_ui',
      pascal: 'ErxesAgentV2',
      title: 'Erxes Agent V2',
    });
  });

  it('keeps a single-word name unchanged', () => {
    const names = derivePluginNames('inventory', ' Stock ');

    expect(names.id).toBe('inventory');
    expect(names.remote).toBe('inventory_ui');
    expect(names.pascal).toBe('Inventory');
    expect(names.title).toBe('Stock');
  });
});
