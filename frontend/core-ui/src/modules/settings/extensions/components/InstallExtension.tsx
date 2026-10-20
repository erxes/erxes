import { useRef, useState } from 'react';
import { Button, Dialog, toast } from 'erxes-ui';
import { IconUpload } from '@tabler/icons-react';
import { describeCron } from '../cron';
import { extensionsApi } from '../extensionsApi';
import { Extension, ExtensionBundle, ExtensionContract } from '../types';

type Pending = {
  raw: unknown;
  bundle: ExtensionBundle;
  // What the runtime serves. Empty when it couldn't say.
  contracts: ExtensionContract[];
};

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
      const bundle = ExtensionBundle.parse(raw);
      const contracts = await extensionsApi.contracts().catch(() => []);
      setPending({ raw, bundle, contracts });
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

  const uses = Object.entries(pending?.bundle.uses ?? {}).map(
    ([host, version]) => ({
      key: `${host}@${version}`,
      label: `${host} v${version}`,
      contract: pending?.contracts.find(
        (c) => c.host === host && c.version === version,
      ),
    }),
  );
  const permissions = Object.entries(pending?.bundle.permissions ?? {}).flatMap(
    ([module, actions]) =>
      Object.entries(actions).map(([action, title]) => ({
        key: `${module}.${action}`,
        title,
      })),
  );
  const network = pending?.bundle.network ?? [];
  const secrets = Object.entries(pending?.bundle.secrets ?? {});
  const current = installed.find((ext) => ext.extId === pending?.bundle.id);
  const schedules = Object.entries(pending?.bundle.schedules ?? {});
  const webhooks = Object.entries(pending?.bundle.webhooks ?? {});
  const events = Object.entries(pending?.bundle.events ?? {});
  const hasTriggers = schedules.length + webhooks.length + events.length > 0;

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
                {uses.map(({ key, label, contract }) => (
                  <li key={key}>
                    {contract ? label : `${label} (not served by this runtime)`}
                    {contract && (
                      <ul className="pl-4">
                        {contract.entries.map((entry) => (
                          <li key={entry.name}>
                            <span className="font-mono">{entry.name}</span>
                            <span className="text-muted-foreground">
                              {' '}
                              {entry.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
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

          <section className="space-y-1 text-sm">
            <h4 className="font-semibold">Internet access</h4>
            {network.length ? (
              <>
                <p className="text-muted-foreground">
                  It can send requests over https to these hosts. A host
                  starting with *. covers its subdomains.
                </p>
                <ul className="list-disc pl-5">
                  {network.map((host) => (
                    <li key={host} className="font-mono">
                      {host}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted-foreground">None</p>
            )}
          </section>

          <section className="space-y-1 text-sm">
            <h4 className="font-semibold">Secrets you set after installing</h4>
            {secrets.length ? (
              <ul className="list-disc pl-5">
                {secrets.map(([name, description]) => (
                  <li key={name}>
                    <span className="font-mono">{name}</span>
                    <span className="text-muted-foreground">
                      {' '}
                      {description}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">None</p>
            )}
          </section>

          <section className="space-y-1 text-sm">
            <h4 className="font-semibold">Runs without anyone calling it</h4>
            {hasTriggers ? (
              <>
                <p className="text-muted-foreground">
                  These run as you, with your permissions, limited to what it
                  reads from erxes above. An event runs as the user who made the
                  change. They stop if you are deactivated or it is disabled.
                </p>
                <ul className="list-disc pl-5">
                  {schedules.map(([name, { cron, function: fn }]) => (
                    <li key={`schedule:${name}`}>
                      {describeCron(cron) ?? 'On a schedule'}{' '}
                      <span className="font-mono text-muted-foreground">
                        {cron} (UTC) runs {fn}
                      </span>
                    </li>
                  ))}
                  {webhooks.map(([name, { function: fn, signature }]) => (
                    <li key={`webhook:${name}`}>
                      Webhook {name}, signed with {signature.secret}{' '}
                      <span className="font-mono text-muted-foreground">
                        runs {fn}
                      </span>
                    </li>
                  ))}
                  {events.map(([name, { on, updatedFields, function: fn }]) => (
                    <li key={`event:${name}`}>
                      When <span className="font-mono">{on}</span>
                      {updatedFields?.length
                        ? ` changes ${updatedFields.join(', ')}`
                        : ''}{' '}
                      <span className="font-mono text-muted-foreground">
                        runs {fn}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted-foreground">Nothing</p>
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
