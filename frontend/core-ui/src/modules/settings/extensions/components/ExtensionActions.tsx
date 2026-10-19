import { useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DropdownMenu,
  Label,
  Select,
  toast,
} from 'erxes-ui';
import { IconDots } from '@tabler/icons-react';
import { extensionsApi } from '../extensionsApi';
import { Extension } from '../types';
import { ExtensionRunsSheet } from './ExtensionRunsSheet';
import { ExtensionSecretsSheet } from './ExtensionSecretsSheet';

type Open = 'version' | 'uninstall' | 'runs' | 'secrets' | null;

export function ExtensionActions({
  ext,
  onChanged,
}: Readonly<{ ext: Extension; onChanged: () => void }>) {
  const [open, setOpen] = useState<Open>(null);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState('');
  const [purge, setPurge] = useState(false);

  const otherVersions = ext.versions.filter((v) => v.version !== ext.version);
  const documents = Object.values(ext.documents).reduce((a, b) => a + b, 0);
  const hasSecrets = Object.keys(ext.secrets ?? {}).length > 0;

  const close = () => {
    setOpen(null);
    setVersion('');
    setPurge(false);
  };

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast({ variant: 'success', title: success });
      close();
      onChanged();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Action failed',
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(false);
    }
  };

  const toggle = () =>
    ext.status === 'installed'
      ? run(() => extensionsApi.disable(ext.extId), `Disabled ${ext.extId}`)
      : run(() => extensionsApi.enable(ext.extId), `Enabled ${ext.extId}`);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={busy}
            aria-label={`Actions for ${ext.extId}`}
          >
            <IconDots />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onSelect={() => setOpen('runs')}>
            Run log
          </DropdownMenu.Item>
          {hasSecrets && (
            <DropdownMenu.Item onSelect={() => setOpen('secrets')}>
              Secrets
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item onSelect={toggle}>
            {ext.status === 'installed' ? 'Disable' : 'Enable'}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            disabled={otherVersions.length === 0}
            onSelect={() => setOpen('version')}
          >
            Switch version
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="text-destructive"
            onSelect={() => setOpen('uninstall')}
          >
            Uninstall
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

      <ExtensionRunsSheet
        extId={ext.extId}
        open={open === 'runs'}
        onClose={close}
      />

      {hasSecrets && (
        <ExtensionSecretsSheet
          extId={ext.extId}
          open={open === 'secrets'}
          onClose={close}
        />
      )}

      <Dialog
        open={open === 'version' || open === 'uninstall'}
        onOpenChange={(isOpen) => !isOpen && !busy && close()}
      >
        <Dialog.Content>
          {open === 'version' && (
            <>
              <Dialog.Header>
                <Dialog.Title>Switch {ext.extId} version</Dialog.Title>
                <Dialog.Description>
                  It runs {ext.version} now. Its data stays as it is.
                </Dialog.Description>
              </Dialog.Header>
              <Select value={version} onValueChange={setVersion}>
                <Select.Trigger>
                  <Select.Value placeholder="Pick a version" />
                </Select.Trigger>
                <Select.Content>
                  {otherVersions.map((v) => (
                    <Select.Item key={v.version} value={v.version}>
                      {v.version}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Dialog.Footer>
                <Button variant="secondary" disabled={busy} onClick={close}>
                  Cancel
                </Button>
                <Button
                  disabled={!version || busy}
                  onClick={() =>
                    run(
                      () => extensionsApi.rollback(ext.extId, version),
                      `${ext.extId} now runs ${version}`,
                    )
                  }
                >
                  Switch
                </Button>
              </Dialog.Footer>
            </>
          )}

          {open === 'uninstall' && (
            <>
              <Dialog.Header>
                <Dialog.Title>Uninstall {ext.extId}?</Dialog.Title>
                <Dialog.Description>
                  It stops running and its screens and permissions go away.
                  Unless you delete its data, installing it again picks up where
                  it left off.
                </Dialog.Description>
              </Dialog.Header>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`purge-${ext.extId}`}
                  checked={purge}
                  onCheckedChange={(checked) => setPurge(checked === true)}
                />
                <Label htmlFor={`purge-${ext.extId}`}>
                  Also delete its data ({documents} documents)
                  {hasSecrets && ' and the secrets you set'}. This can't be
                  undone.
                </Label>
              </div>
              <Dialog.Footer>
                <Button variant="secondary" disabled={busy} onClick={close}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => extensionsApi.uninstall(ext.extId, purge),
                      purge
                        ? `Uninstalled ${ext.extId} and deleted its data`
                        : `Uninstalled ${ext.extId}`,
                    )
                  }
                >
                  {purge ? 'Uninstall and delete data' : 'Uninstall'}
                </Button>
              </Dialog.Footer>
            </>
          )}
        </Dialog.Content>
      </Dialog>
    </>
  );
}
