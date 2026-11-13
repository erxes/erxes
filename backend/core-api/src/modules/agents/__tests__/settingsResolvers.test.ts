/**
 * Tenant settings resolver tests.
 *
 * The guarantees under test:
 *
 * - the settings query is gated behind `showAgents` and returns the
 *   tenant's current flags;
 * - the update mutation is gated behind `manageAgentsSettings` (the
 *   admin-only action) and short-circuits before any model access when the
 *   check fails;
 * - the update requires at least one field, rejects unknown environments,
 *   and persists only the provided fields.
 */

import { agentsSettingsQueries } from '@/agents/graphql/resolvers/queries/settings';
import { agentsSettingsMutations } from '@/agents/graphql/resolvers/mutations/settings';
import type { IContext } from '~/connectionResolvers';

interface IFakeSettingsModel {
  getSettings: jest.Mock;
  updateSettings: jest.Mock;
}

const SETTINGS_DOC = {
  _id: 'settings-1',
  codeModeEnabled: false,
  codeModeEnvironment: 'in-process',
  updatedAt: new Date('2026-08-31T00:00:00.000Z'),
};

const buildContext = ({
  permissionAllowed = true,
}: {
  permissionAllowed?: boolean;
} = {}) => {
  const checkPermission = jest.fn(async () => {
    if (!permissionAllowed) {
      throw new Error('Permission denied');
    }
  });

  const settingsModel: IFakeSettingsModel = {
    getSettings: jest.fn(async () => ({ ...SETTINGS_DOC })),
    updateSettings: jest.fn(
      async (input: {
        codeModeEnabled?: boolean;
        codeModeEnvironment?: string;
        approvalMode?: string;
      }) => ({
        ...SETTINGS_DOC,
        ...(input.codeModeEnabled !== undefined
          ? { codeModeEnabled: input.codeModeEnabled }
          : {}),
        ...(input.codeModeEnvironment !== undefined
          ? { codeModeEnvironment: input.codeModeEnvironment }
          : {}),
        ...(input.approvalMode !== undefined
          ? { approvalMode: input.approvalMode }
          : {}),
      }),
    ),
  };

  const ctx = {
    user: { _id: 'user-1' },
    checkPermission,
    models: { AgentsSettings: settingsModel },
  } as unknown as IContext;

  return { ctx, checkPermission, settingsModel };
};

describe('agentsSettings query', () => {
  it('returns the tenant settings behind showAgents', async () => {
    const { ctx, checkPermission, settingsModel } = buildContext();

    const result = await agentsSettingsQueries.agentsSettings(
      undefined,
      undefined,
      ctx,
    );

    expect(checkPermission).toHaveBeenCalledWith('showAgents');
    expect(settingsModel.getSettings).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      codeModeEnabled: false,
      codeModeEnvironment: 'in-process',
      updatedAt: SETTINGS_DOC.updatedAt,
    });
  });

  it('short-circuits before model access when the permission check fails', async () => {
    const { ctx, settingsModel } = buildContext({ permissionAllowed: false });

    await expect(
      agentsSettingsQueries.agentsSettings(undefined, undefined, ctx),
    ).rejects.toThrow('Permission denied');
    expect(settingsModel.getSettings).not.toHaveBeenCalled();
  });
});

describe('agentsSettingsUpdate mutation', () => {
  it('is gated behind the admin-only manageAgentsSettings action', async () => {
    const { ctx, checkPermission, settingsModel } = buildContext();

    await agentsSettingsMutations.agentsSettingsUpdate(
      undefined,
      { codeModeEnabled: true },
      ctx,
    );

    expect(checkPermission).toHaveBeenCalledWith('manageAgentsSettings');
    expect(settingsModel.updateSettings).toHaveBeenCalledTimes(1);
  });

  it('short-circuits before model access when the permission check fails', async () => {
    const { ctx, settingsModel } = buildContext({ permissionAllowed: false });

    await expect(
      agentsSettingsMutations.agentsSettingsUpdate(
        undefined,
        { codeModeEnabled: true },
        ctx,
      ),
    ).rejects.toThrow('Permission denied');
    expect(settingsModel.updateSettings).not.toHaveBeenCalled();
  });

  it('requires at least one field to update', async () => {
    const { ctx, settingsModel } = buildContext();

    await expect(
      agentsSettingsMutations.agentsSettingsUpdate(undefined, {}, ctx),
    ).rejects.toThrow('Provide at least one setting to update.');
    expect(settingsModel.updateSettings).not.toHaveBeenCalled();
  });

  it('rejects an unsupported sandbox environment', async () => {
    const { ctx, settingsModel } = buildContext();

    await expect(
      agentsSettingsMutations.agentsSettingsUpdate(
        undefined,
        { codeModeEnvironment: 'remote' },
        ctx,
      ),
    ).rejects.toThrow('Unsupported code mode environment "remote".');
    expect(settingsModel.updateSettings).not.toHaveBeenCalled();
  });

  it('persists the enabled flag and returns the public shape', async () => {
    const { ctx, settingsModel } = buildContext();

    const result = await agentsSettingsMutations.agentsSettingsUpdate(
      undefined,
      { codeModeEnabled: true },
      ctx,
    );

    expect(settingsModel.updateSettings).toHaveBeenCalledWith({
      codeModeEnabled: true,
    });
    expect(result).toMatchObject({
      codeModeEnabled: true,
      codeModeEnvironment: 'in-process',
    });
  });

  it('updates the environment without touching the flag', async () => {
    const { ctx, settingsModel } = buildContext();

    const result = await agentsSettingsMutations.agentsSettingsUpdate(
      undefined,
      { codeModeEnvironment: 'in-process' },
      ctx,
    );

    expect(settingsModel.updateSettings).toHaveBeenCalledWith({
      codeModeEnvironment: 'in-process',
    });
    expect(result).toMatchObject({ codeModeEnabled: false });
  });
});

describe('approvalMode', () => {
  it('persists a valid approvalMode', async () => {
    const { ctx, settingsModel } = buildContext();

    const result = await agentsSettingsMutations.agentsSettingsUpdate(
      undefined,
      { approvalMode: 'destructive' },
      ctx,
    );

    expect(settingsModel.updateSettings).toHaveBeenCalledWith({
      approvalMode: 'destructive',
    });
    expect(result.approvalMode).toBe('destructive');
  });

  it('rejects an unknown approvalMode', async () => {
    const { ctx, settingsModel } = buildContext();

    await expect(
      agentsSettingsMutations.agentsSettingsUpdate(
        undefined,
        { approvalMode: 'everything' },
        ctx,
      ),
    ).rejects.toThrow('Unsupported approval mode');
    expect(settingsModel.updateSettings).not.toHaveBeenCalled();
  });

  it('falls back to writes for documents written before approvalMode', async () => {
    const { ctx } = buildContext();

    // SETTINGS_DOC predates approvalMode — the public shape defaults to
    // the fail-safe mode.
    const settings = await agentsSettingsQueries.agentsSettings(
      undefined,
      undefined,
      ctx,
    );

    expect(settings.approvalMode).toBe('writes');
  });
});
