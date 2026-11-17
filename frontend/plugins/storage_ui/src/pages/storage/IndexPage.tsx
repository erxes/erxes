import React, { useEffect, useState } from 'react';
import { IconPackage } from '@tabler/icons-react';
import { useMutation, useQuery } from '@apollo/client';
import { Badge, Button, Table, Tabs } from 'erxes-ui';
import { PageHeader, SelectBranches, SelectDepartments, SelectProduct } from 'ui-modules';
import {
  INVENTORY_ACCOUNTS_QUERY,
  STORAGE_BREAK_BOXES,
  STORAGE_MOVEMENT_RETRY,
  STORAGE_MOVEMENTS_QUERY,
  STORAGE_RFID_SCAN_SUBMIT,
  STORAGE_RFID_SUMMARY_QUERY,
  STORAGE_RFID_TAGS_QUERY,
  STORAGE_RFID_TAGS_REGISTER,
  STORAGE_SCAN_SESSIONS_QUERY,
  STORAGE_ZONE_REMOVE,
  STORAGE_ZONE_SAVE,
  STORAGE_ZONES_QUERY,
} from '~/modules/storage/graphql/operations';
import {
  IAccountOption,
  IAccountsQueryResult,
  IMovementsQueryResult,
  IRegisterResult,
  IScanSession,
  IScanSessionsQueryResult,
  IScanSubmitResult,
  IStorageMovement,
  IStorageZone,
  ISummaryQueryResult,
  ITagsQueryResult,
  IZonesQueryResult,
  ZoneLocationInput,
} from '~/modules/storage/types';
import { newRequestKey, parseEpcList, productLabel, singleValue } from '~/modules/storage/utils';

const INPUT_CLASS = 'border rounded px-2 py-1 text-sm';
const EMPTY_LOCATION: ZoneLocationInput = { accountId: '', branchId: '', departmentId: '' };

const ACCOUNTING_BADGE: Record<IStorageMovement['accountingStatus'], { variant: 'success' | 'warning' | 'destructive'; label: string }> = {
  success: { variant: 'success', label: 'Бүртгэгдсэн' },
  pending: { variant: 'warning', label: 'Хүлээгдэж буй' },
  error: { variant: 'destructive', label: 'Алдаа' },
};

const isCompleteLocation = (loc: ZoneLocationInput) => Boolean(loc.accountId && loc.branchId && loc.departmentId);

const locationText = (loc: IStorageZone['sealed']) =>
  [loc.branch?.title || loc.branchId, loc.department?.title || loc.departmentId].join(' / ');

// ---------------------------------------------------------------------------
// Tags: balance by product, register new tags, break sealed boxes
// ---------------------------------------------------------------------------

const TagsTab = ({ zoneId, onError }: { zoneId: string; onError: (e: Error) => void }) => {
  const [productId, setProductId] = useState('');
  const [unitsInPack, setUnitsInPack] = useState(1);
  const [count, setCount] = useState(1);
  const [registerEpcs, setRegisterEpcs] = useState('');
  const [breakEpcs, setBreakEpcs] = useState('');
  const [lastBatch, setLastBatch] = useState<IRegisterResult['storageRfidTagsRegister'] | null>(null);

  const summary = useQuery<ISummaryQueryResult>(STORAGE_RFID_SUMMARY_QUERY, { variables: { zoneId } });
  const tags = useQuery<ITagsQueryResult>(STORAGE_RFID_TAGS_QUERY, {
    variables: { zoneId, status: 'SEALED', page: 1, perPage: 50 },
  });

  const refetchAll = () => {
    summary.refetch();
    tags.refetch();
  };

  const [registerTags, registering] = useMutation<IRegisterResult>(STORAGE_RFID_TAGS_REGISTER, {
    onError,
    onCompleted: (res) => {
      setLastBatch(res.storageRfidTagsRegister);
      setRegisterEpcs('');
      refetchAll();
    },
  });
  const [breakBoxes, breaking] = useMutation(STORAGE_BREAK_BOXES, {
    onError,
    onCompleted: () => {
      setBreakEpcs('');
      refetchAll();
    },
  });

  const scannedToRegister = parseEpcList(registerEpcs);
  const toBreak = parseEpcList(breakEpcs);
  const canRegister = Boolean(productId) && unitsInPack >= 1 && (scannedToRegister.length > 0 || count >= 1);

  const onRegister = () =>
    registerTags({
      variables: {
        productId,
        zoneId,
        unitsInPack,
        ...(scannedToRegister.length > 0 ? { epcIds: scannedToRegister } : { count }),
      },
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-3 space-y-2">
          <h4 className="font-semibold text-sm">Ялтас бүртгэх (битүү хайрцаг)</h4>
          <SelectProduct value={productId} onValueChange={(v) => setProductId(singleValue(v))} />
          <div className="flex gap-2 items-center text-sm">
            <span>Хайрцагт:</span>
            <input type="number" min={1} className={`${INPUT_CLASS} w-20`} value={unitsInPack} onChange={(e) => setUnitsInPack(Number(e.target.value))} />
            <span>ш</span>
            <span className="ml-2">Хайрцагны тоо:</span>
            <input type="number" min={1} className={`${INPUT_CLASS} w-20`} value={count} disabled={scannedToRegister.length > 0} onChange={(e) => setCount(Number(e.target.value))} />
          </div>
          <textarea
            className={`${INPUT_CLASS} w-full font-mono`}
            rows={3}
            placeholder="Эсвэл уншигчаас гарсан EPC кодуудыг энд буулгана (мөр бүрт нэг)"
            value={registerEpcs}
            onChange={(e) => setRegisterEpcs(e.target.value)}
          />
          <Button size="sm" disabled={!canRegister || registering.loading} onClick={onRegister}>
            {scannedToRegister.length > 0 ? `${scannedToRegister.length} ялтас бүртгэх` : 'Ялтас үүсгэх'}
          </Button>
          {lastBatch && (
            <div className="text-xs text-muted-foreground">
              {lastBatch.count} ялтас бүртгэгдлээ. Багц: {lastBatch.batchId}
            </div>
          )}
        </div>

        <div className="border rounded-lg p-3 space-y-2">
          <h4 className="font-semibold text-sm">Хайрцаг задлах (битүү → задгай)</h4>
          <textarea
            className={`${INPUT_CLASS} w-full font-mono`}
            rows={5}
            placeholder="Задлах хайрцгуудын EPC кодыг уншуулж буулгана (мөр бүрт нэг)"
            value={breakEpcs}
            onChange={(e) => setBreakEpcs(e.target.value)}
          />
          <Button
            size="sm"
            disabled={toBreak.length === 0 || breaking.loading}
            onClick={() => breakBoxes({ variables: { epcIds: toBreak, requestKey: newRequestKey() } })}
          >
            {toBreak.length} хайрцаг задлах
          </Button>
          <div className="text-xs text-muted-foreground">
            Задалсан хөдөлгөөнийг санхүүгийн модуль агуулах хоорондын шилжүүлгээр бүртгэнэ.
          </div>
        </div>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Бараа</Table.Head>
            <Table.Head>Битүү хайрцаг</Table.Head>
            <Table.Head>Битүү ширхэг</Table.Head>
            <Table.Head>Задалсан хайрцаг</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(summary.data?.storageRfidSummary || []).map((row) => (
            <Table.Row key={row.productId}>
              <Table.Cell>{productLabel(row.productId, row.product)}</Table.Cell>
              <Table.Cell>{row.sealedPacks}</Table.Cell>
              <Table.Cell>{row.sealedUnits}</Table.Cell>
              <Table.Cell>{row.openedPacks}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div>
        <h4 className="font-semibold text-sm mb-2">
          Битүү ялтаснууд ({tags.data?.storageRfidTags.totalCount ?? 0}), эхний 50
        </h4>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>EPC</Table.Head>
              <Table.Head>Бараа</Table.Head>
              <Table.Head>Хайрцагт</Table.Head>
              <Table.Head />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(tags.data?.storageRfidTags.list || []).map((tag) => (
              <Table.Row key={tag._id}>
                <Table.Cell className="font-mono text-xs">{tag.epcId}</Table.Cell>
                <Table.Cell>{productLabel(tag.productId, tag.product)}</Table.Cell>
                <Table.Cell>{tag.unitsInPack}</Table.Cell>
                <Table.Cell>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={breaking.loading}
                    onClick={() => breakBoxes({ variables: { epcIds: [tag.epcId], requestKey: newRequestKey() } })}
                  >
                    Задлах
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Scan: paste reader output, compare with registered sealed tags
// ---------------------------------------------------------------------------

const EpcSample = ({ title, total, epcIds }: { title: string; total: number; epcIds: string[] }) =>
  total === 0 ? null : (
    <div className="text-xs">
      <span className="font-semibold">{title} ({total}):</span>{' '}
      <span className="font-mono">{epcIds.join(', ')}</span>
      {total > epcIds.length && <span> …</span>}
    </div>
  );

const ScanResult = ({ session }: { session: IScanSession }) => (
  <div className="border rounded-lg p-3 space-y-3">
    <div className="flex flex-wrap gap-2 text-sm">
      <Badge variant="secondary">Уншсан: {session.scannedCount}</Badge>
      <Badge variant="success">Таарсан: {session.matchedCount}</Badge>
      <Badge variant={session.missingCount > 0 ? 'destructive' : 'secondary'}>Дутуу: {session.missingCount}</Badge>
      <Badge variant={session.unknownCount > 0 ? 'warning' : 'secondary'}>Бүртгэлгүй: {session.unknownCount}</Badge>
      <Badge variant={session.openedCount > 0 ? 'warning' : 'secondary'}>Задалсан гэж бүртгэлтэй: {session.openedCount}</Badge>
      <Badge variant={session.otherZoneCount > 0 ? 'warning' : 'secondary'}>Өөр агуулахынх: {session.otherZoneCount}</Badge>
    </div>
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Head>Бараа</Table.Head>
          <Table.Head>Бүртгэлээр</Table.Head>
          <Table.Head>Уншсан</Table.Head>
          <Table.Head>Зөрүү</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {session.products.map((row) => (
          <Table.Row key={row.productId}>
            <Table.Cell>{productLabel(row.productId, row.product)}</Table.Cell>
            <Table.Cell>{row.expectedPacks}</Table.Cell>
            <Table.Cell>{row.scannedPacks}</Table.Cell>
            <Table.Cell>
              <Badge variant={row.scannedPacks === row.expectedPacks ? 'success' : 'destructive'}>
                {row.scannedPacks - row.expectedPacks}
              </Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
    <EpcSample title="Дутуу" total={session.missingCount} epcIds={session.missingEpcIds} />
    <EpcSample title="Бүртгэлгүй" total={session.unknownCount} epcIds={session.unknownEpcIds} />
    <EpcSample title="Задалсан" total={session.openedCount} epcIds={session.openedEpcIds} />
    <EpcSample title="Өөр агуулахынх" total={session.otherZoneCount} epcIds={session.otherZoneEpcIds} />
  </div>
);

const ScanTab = ({ zoneId, onError }: { zoneId: string; onError: (e: Error) => void }) => {
  const [epcText, setEpcText] = useState('');
  const [result, setResult] = useState<IScanSession | null>(null);

  const sessions = useQuery<IScanSessionsQueryResult>(STORAGE_SCAN_SESSIONS_QUERY, { variables: { zoneId, limit: 5 } });
  const [submitScan, submitting] = useMutation<IScanSubmitResult>(STORAGE_RFID_SCAN_SUBMIT, {
    onError,
    onCompleted: (res) => {
      setResult(res.storageRfidScanSubmit);
      sessions.refetch();
    },
  });

  useEffect(() => setResult(null), [zoneId]);

  const epcIds = parseEpcList(epcText);

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-3 space-y-2">
        <h4 className="font-semibold text-sm">RFID тооллого</h4>
        <textarea
          className={`${INPUT_CLASS} w-full font-mono`}
          rows={6}
          placeholder="Антен/уншигчаас гарсан EPC кодуудыг энд буулгана (мөр бүрт нэг)"
          value={epcText}
          onChange={(e) => setEpcText(e.target.value)}
        />
        <Button size="sm" disabled={epcIds.length === 0 || submitting.loading} onClick={() => submitScan({ variables: { zoneId, epcIds } })}>
          {epcIds.length} ялтас тулгах
        </Button>
      </div>

      {result && <ScanResult session={result} />}

      <div>
        <h4 className="font-semibold text-sm mb-2">Сүүлийн тооллогууд</h4>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Огноо</Table.Head>
              <Table.Head>Уншсан</Table.Head>
              <Table.Head>Таарсан</Table.Head>
              <Table.Head>Дутуу</Table.Head>
              <Table.Head>Бүртгэлгүй</Table.Head>
              <Table.Head />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(sessions.data?.storageScanSessions || []).map((s) => (
              <Table.Row key={s._id}>
                <Table.Cell>{s.createdAt ? new Date(s.createdAt).toLocaleString('mn-MN') : '-'}</Table.Cell>
                <Table.Cell>{s.scannedCount}</Table.Cell>
                <Table.Cell>{s.matchedCount}</Table.Cell>
                <Table.Cell>{s.missingCount}</Table.Cell>
                <Table.Cell>{s.unknownCount}</Table.Cell>
                <Table.Cell>
                  <Button size="sm" variant="outline" onClick={() => setResult(s)}>Харах</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Movements: what storage sent to accounting and what accounting answered
// ---------------------------------------------------------------------------

const MovementsTab = ({ onError }: { onError: (e: Error) => void }) => {
  const movements = useQuery<IMovementsQueryResult>(STORAGE_MOVEMENTS_QUERY, {
    variables: { page: 1, perPage: 50 },
    fetchPolicy: 'cache-and-network',
  });
  const [retry, retrying] = useMutation(STORAGE_MOVEMENT_RETRY, { onError, onCompleted: () => movements.refetch() });

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => movements.refetch()}>Шинэчлэх</Button>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Дугаар</Table.Head>
            <Table.Head>Огноо</Table.Head>
            <Table.Head>Бараа</Table.Head>
            <Table.Head>Санхүүгийн бүртгэл</Table.Head>
            <Table.Head />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(movements.data?.storageMovements || []).map((m) => {
            const badge = ACCOUNTING_BADGE[m.accountingStatus];
            return (
              <Table.Row key={m._id}>
                <Table.Cell className="font-mono text-xs">{m.number}</Table.Cell>
                <Table.Cell>{new Date(m.date).toLocaleString('mn-MN')}</Table.Cell>
                <Table.Cell>
                  {m.items.map((it) => (
                    <div key={it.productId}>
                      {productLabel(it.productId, it.product)}: {it.quantity} ш ({it.epcIds.length} хайрцаг)
                    </div>
                  ))}
                </Table.Cell>
                <Table.Cell>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  {m.accountingStatus === 'error' && m.accountingResponse && (
                    <div className="text-xs text-destructive mt-1">{m.accountingResponse}</div>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {m.accountingStatus !== 'success' && (
                    <Button size="sm" variant="outline" disabled={retrying.loading} onClick={() => retry({ variables: { _id: m._id } })}>
                      Дахин илгээх
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Zones: a warehouse with its sealed and open accounting locations
// ---------------------------------------------------------------------------

const LocationFields = ({
  title,
  value,
  accounts,
  onChange,
}: {
  title: string;
  value: ZoneLocationInput;
  accounts: IAccountOption[];
  onChange: (value: ZoneLocationInput) => void;
}) => (
  <div className="space-y-2">
    <div className="text-sm font-medium">{title}</div>
    <select className={`${INPUT_CLASS} w-full`} value={value.accountId} onChange={(e) => onChange({ ...value, accountId: e.target.value })}>
      <option value="">— Бараа материалын данс —</option>
      {accounts.map((a) => (
        <option key={a._id} value={a._id}>{a.code} {a.name}</option>
      ))}
    </select>
    <SelectBranches.Root mode="single" value={value.branchId} onValueChange={(v) => onChange({ ...value, branchId: singleValue(v) })} />
    <SelectDepartments.Root mode="single" value={value.departmentId} onValueChange={(v) => onChange({ ...value, departmentId: singleValue(v) })} />
  </div>
);

const ZonesTab = ({ zones, onChanged, onError }: { zones: IStorageZone[]; onChanged: () => void; onError: (e: Error) => void }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sealed, setSealed] = useState<ZoneLocationInput>(EMPTY_LOCATION);
  const [open, setOpen] = useState<ZoneLocationInput>(EMPTY_LOCATION);

  const accounts = useQuery<IAccountsQueryResult>(INVENTORY_ACCOUNTS_QUERY);

  const reset = () => {
    setEditingId(null);
    setName('');
    setSealed(EMPTY_LOCATION);
    setOpen(EMPTY_LOCATION);
  };

  const [saveZone, saving] = useMutation(STORAGE_ZONE_SAVE, {
    onError,
    onCompleted: () => {
      reset();
      onChanged();
    },
  });
  const [removeZone] = useMutation(STORAGE_ZONE_REMOVE, { onError, onCompleted: onChanged });

  const edit = (zone: IStorageZone) => {
    setEditingId(zone._id);
    setName(zone.name);
    setSealed({ accountId: zone.sealed.accountId, branchId: zone.sealed.branchId, departmentId: zone.sealed.departmentId });
    setOpen({ accountId: zone.open.accountId, branchId: zone.open.branchId, departmentId: zone.open.departmentId });
  };

  const canSave = Boolean(name.trim()) && isCompleteLocation(sealed) && isCompleteLocation(open);

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-3 space-y-3">
        <h4 className="font-semibold text-sm">{editingId ? 'Агуулах засах' : 'Шинэ агуулах'}</h4>
        <input className={`${INPUT_CLASS} w-full`} placeholder="Агуулахын нэр" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocationFields title="Битүү (RFID) бүс" value={sealed} accounts={accounts.data?.accounts || []} onChange={setSealed} />
          <LocationFields title="Задгай бүс" value={open} accounts={accounts.data?.accounts || []} onChange={setOpen} />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={!canSave || saving.loading}
            onClick={() => saveZone({ variables: { _id: editingId || undefined, name: name.trim(), sealed, open } })}
          >
            Хадгалах
          </Button>
          {editingId && <Button size="sm" variant="outline" onClick={reset}>Болих</Button>}
        </div>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Агуулах</Table.Head>
            <Table.Head>Битүү бүс (салбар / хэлтэс)</Table.Head>
            <Table.Head>Задгай бүс (салбар / хэлтэс)</Table.Head>
            <Table.Head />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {zones.map((zone) => (
            <Table.Row key={zone._id}>
              <Table.Cell>{zone.name}</Table.Cell>
              <Table.Cell>{locationText(zone.sealed)}</Table.Cell>
              <Table.Cell>{locationText(zone.open)}</Table.Cell>
              <Table.Cell className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => edit(zone)}>Засах</Button>
                <Button size="sm" variant="outline" onClick={() => removeZone({ variables: { _id: zone._id } })}>Устгах</Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const IndexPage: React.FC = () => {
  const [zoneId, setZoneId] = useState('');
  const [error, setError] = useState('');

  const zonesQuery = useQuery<IZonesQueryResult>(STORAGE_ZONES_QUERY);
  const zones = zonesQuery.data?.storageZones || [];
  const activeZoneId = zones.some((z) => z._id === zoneId) ? zoneId : zones[0]?._id || '';

  const onError = (e: Error) => setError(e.message);
  const noZone = <div className="text-sm text-muted-foreground">Эхлээд «Агуулах» таб дээр агуулах үүсгэнэ үү.</div>;

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <IconPackage />
          <span className="font-medium">RFID агуулах</span>
        </PageHeader.Start>
        <PageHeader.End>
          <select className={INPUT_CLASS} value={activeZoneId} onChange={(e) => setZoneId(e.target.value)}>
            {zones.length === 0 && <option value="">Агуулах байхгүй</option>}
            {zones.map((z) => (
              <option key={z._id} value={z._id}>{z.name}</option>
            ))}
          </select>
        </PageHeader.End>
      </PageHeader>
      <div className="flex-auto overflow-auto p-6">
        {error && (
          <div className="mb-4 flex justify-between items-center rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span>{error}</span>
            <Button size="sm" variant="ghost" onClick={() => setError('')}>✕</Button>
          </div>
        )}
        <Tabs defaultValue="tags">
          <Tabs.List>
            <Tabs.Trigger value="tags">Ялтас ба хайрцаг</Tabs.Trigger>
            <Tabs.Trigger value="scan">Тооллого</Tabs.Trigger>
            <Tabs.Trigger value="movements">Хөдөлгөөн</Tabs.Trigger>
            <Tabs.Trigger value="zones">Агуулах</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tags" className="mt-4">
            {activeZoneId ? <TagsTab key={activeZoneId} zoneId={activeZoneId} onError={onError} /> : noZone}
          </Tabs.Content>
          <Tabs.Content value="scan" className="mt-4">
            {activeZoneId ? <ScanTab zoneId={activeZoneId} onError={onError} /> : noZone}
          </Tabs.Content>
          <Tabs.Content value="movements" className="mt-4">
            <MovementsTab onError={onError} />
          </Tabs.Content>
          <Tabs.Content value="zones" className="mt-4">
            <ZonesTab zones={zones} onChanged={() => zonesQuery.refetch()} onError={onError} />
          </Tabs.Content>
        </Tabs>
      </div>
    </div>
  );
};
