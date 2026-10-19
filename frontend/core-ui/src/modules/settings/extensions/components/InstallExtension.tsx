import { useRef, useState } from 'react';
import { Button, Dialog, toast } from 'erxes-ui';
import { IconUpload } from '@tabler/icons-react';
import { extensionsApi } from '../extensionsApi';
import { Extension, ExtensionBundle } from '../types';

// What each contract version lets an extension do, as the SDK's contracts
// define their entries. A pin missing here shows as just "host vN".
const CONTRACT_ENTRIES: Record<string, Record<number, string[]>> = {
  sales: { 1: ['read deals', 'read stages'] },
};

const describeUse = (host: string, version: number) => {
  const entries = CONTRACT_ENTRIES[host]?.[version];
  return entries
    ? `${host} v${version}: ${entries.join(', ')}`
    : `${host} v${version}`;
};

type Pending = { raw: unknown; bundle: ExtensionBundle };

export function InstallExtension({
  installed,
  onInstalled,
}: Readonly<{ installed: Extension[]; onInstalled: () => void }>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [installing, setInstalling] = useState(false);

  const pick = async (file: File) => {
    try {
      const raw: unknown = JSON.parse(await file.text());
      setPending({ raw, bundle: ExtensionBundle.parse(raw) });
    } catch {
      toast({
        variant: 'destructive',
        title: `${file.name} is not an extension bundle`,
        description: 'Pick the .erxext.json file the extension build wrote.',
      });
    }
  };

  const install = async () => {
    if (!pending) return;
    setInstalling(true);
    try {
      const { id, version } = await extensionsApi.install(pending.raw);
      toast({ variant: 'success', title: `Installed ${id} ${version}` });
      setPending(null);
      onInstalled();
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Install failed',
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setInstalling(false);
    }
  };

  const uses = Object.entries(pending?.bundle.uses ?? {});
  const permissions = Object.entries(pending?.bundle.permissions ?? {}).flatMap(
    ([module, actions]) =>
      Object.entries(actions).map(([action, title]) => ({
        key: `${module}.${action}`,
        title,
      })),
  );
  const current = installed.find((ext) => ext.extId === pending?.bundle.id);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) pick(file);
        }}
      />
      <Button onClick={() => inputRef.current?.click()}>
        <IconUpload />
        Install from file
      </Button>

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => !open && !installing && setPending(null)}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              Install {pending?.bundle.id} {pending?.bundle.version}?
            </Dialog.Title>
            <Dialog.Description>
              {current
                ? `Replaces version ${current.version}, which stays available to switch back to.`
                : 'Review what it asks for before installing.'}
            </Dialog.Description>
          </Dialog.Header>

          <section className="space-y-1 text-sm">
            <h4 className="font-semibold">Reads from erxes</h4>
            {uses.length ? (
              <ul className="list-disc pl-5">
                {uses.map(([host, version]) => (
                  <li key={host}>{describeUse(host, version)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                Nothing outside its own data
              </p>
            )}
          </section>

          <section className="space-y-1 text-sm">
            <h4 className="font-semibold">Permission actions it adds</h4>
            {permissions.length ? (
              <ul className="list-disc pl-5">
                {permissions.map((p) => (
                  <li key={p.key}>
                    {p.title}{' '}
                    <span className="font-mono text-muted-foreground">
                      {p.key}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">None</p>
            )}
          </section>

          <Dialog.Footer>
            <Button
              variant="secondary"
              disabled={installing}
              onClick={() => setPending(null)}
            >
              Cancel
            </Button>
            <Button disabled={installing} onClick={install}>
              {installing ? 'Installing...' : 'Install'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
