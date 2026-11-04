import { useRef, useState } from 'react';
import { Badge, Button, Dialog, toast } from 'erxes-ui';
import { IconUpload } from '@tabler/icons-react';
import { extensionsApi } from '../extensionsApi';
import { Extension, ExtensionBundle, ExtensionOperation } from '../types';

type Pending = {
  raw: unknown;
  bundle: ExtensionBundle;
  operations: ExtensionOperation[];
};

const KIND_BADGE = {
  read: { label: 'read', variant: 'secondary' },
  write: { label: 'write', variant: 'warning' },
  destructive: { label: 'write, can delete', variant: 'destructive' },
} as const;

const Section = ({
  title,
  empty,
  children,
}: Readonly<{ title: string; empty: string; children: React.ReactNode[] }>) => (
  <section className="space-y-1 text-sm">
    <h4 className="font-semibold">{title}</h4>
    {children.length ? (
      <ul className="list-disc space-y-1 pl-5">{children}</ul>
    ) : (
      <p className="text-muted-foreground">{empty}</p>
    )}
  </section>
);

export function InstallExtension({
  installed,
  onInstalled,
}: Readonly<{ installed: Extension[]; onInstalled: () => void }>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [installing, setInstalling] = useState(false);

  const pick = async (file: File) => {
    let raw: unknown;
    let bundle: ExtensionBundle;

    try {
      raw = JSON.parse(await file.text());
      bundle = ExtensionBundle.parse(raw);
    } catch {
      toast({
        variant: 'destructive',
        title: `${file.name} is not an extension bundle`,
        description: 'Pick the .erxext.json file the extension build wrote.',
      });
      return;
    }

    try {
      const operations = Object.keys(bundle.operations).length
        ? await extensionsApi.operations(bundle.operations)
        : [];
      setPending({ raw, bundle, operations });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: `${bundle.id} can't be installed`,
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const install = async () => {
    if (!pending) return;
    setInstalling(true);
    try {
      const { id, version, reactivated } = await extensionsApi.install(
        pending.raw,
      );
      toast({
        variant: 'success',
        title: `${reactivated ? 'Reactivated' : 'Installed'} ${id} ${version}`,
      });
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

  // Each root field once per kind, across every operation that selects it.
  const fields = [
    ...new Map(
      (pending?.operations ?? []).flatMap(({ kind, fields }) =>
        fields.map((field) => [`${kind}:${field}`, { kind, field }] as const),
      ),
    ).values(),
  ];
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

          <Section
            title="Uses in erxes, as the signed-in user"
            empty="Nothing outside its own data"
          >
            {fields.map(({ kind, field }) => (
              <li key={`${kind}:${field}`}>
                <span className="font-mono">{field}</span>{' '}
                <Badge variant={KIND_BADGE[kind].variant}>
                  {KIND_BADGE[kind].label}
                </Badge>
              </li>
            ))}
          </Section>

          <Section title="Its own data" empty="None">
            {(pending?.bundle.collections ?? []).map((name) => (
              <li key={name} className="font-mono">
                {name}
              </li>
            ))}
          </Section>

          <Section title="Permission actions it adds" empty="None">
            {permissions.map((p) => (
              <li key={p.key}>
                {p.title}{' '}
                <span className="font-mono text-muted-foreground">{p.key}</span>
              </li>
            ))}
          </Section>

          <Section title="Screens" empty="None">
            {pending?.bundle.ui
              ? [<li key="ui">Adds its own screens and actions to erxes</li>]
              : []}
          </Section>

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
