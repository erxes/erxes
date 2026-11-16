import React, { useState } from 'react';
import { IconPackage } from '@tabler/icons-react';
import { PageHeader } from 'ui-modules';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { Badge, Button, Tabs, Table } from 'erxes-ui';
import {
  STORAGE_ITEMS_QUERY,
  STORAGE_RFID_SCAN_QUERY,
  STORAGE_WORK_ORDERS_QUERY,
  STORAGE_TOOL_ASSETS_QUERY,
  STORAGE_VAT_DATA_QUERY,
  STORAGE_BREAK_SEALED_BOX,
  STORAGE_ISSUE_STOCK,
  STORAGE_WORK_ORDER_CLOSE,
  STORAGE_WORK_ORDER_REOPEN,
  STORAGE_TOOL_ACCEPT,
  STORAGE_VAT_AUTO_RECONCILE,
  STORAGE_VAT_MANUAL_RECONCILE,
} from '~/modules/storage/graphql/operations';

const fmt = (n: number) => `${new Intl.NumberFormat('mn-MN').format(Math.round(n || 0))}₮`;

function chunkForDotMatrix<T>(rows: T[], rowsPerPage = 13): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < rows.length; i += rowsPerPage) {
    pages.push(rows.slice(i, i + rowsPerPage));
  }
  return pages.length ? pages : [[]];
}

export const IndexPage: React.FC = () => {
  const [company, setCompany] = useState<string>('');
  const [printMode, setPrintMode] = useState<'NAME' | 'NICKNAME'>('NICKNAME');
  const [printerType, setPrinterType] = useState<'A4' | 'DOT_MATRIX_13'>('DOT_MATRIX_13');
  const [packingLines, setPackingLines] = useState<any[]>([]);
  const [selectedPayables, setSelectedPayables] = useState<string[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<string>('');

  const { data: itemsData, refetch: refetchItems } = useQuery(STORAGE_ITEMS_QUERY, {
    variables: { company: company || undefined },
  });
  const [runRfidScan, { data: rfidData }] = useLazyQuery(STORAGE_RFID_SCAN_QUERY, {
    fetchPolicy: 'network-only',
  });
  const { data: woData, refetch: refetchWo } = useQuery(STORAGE_WORK_ORDERS_QUERY);
  const { data: toolsData, refetch: refetchTools } = useQuery(STORAGE_TOOL_ASSETS_QUERY);
  const { data: vatData, refetch: refetchVat } = useQuery(STORAGE_VAT_DATA_QUERY);

  const [breakBox] = useMutation(STORAGE_BREAK_SEALED_BOX, { onCompleted: () => refetchItems() });
  const [issueStock] = useMutation(STORAGE_ISSUE_STOCK, {
    onCompleted: (res) => {
      refetchItems();
      refetchWo();
      refetchTools();
      const it = res.storageIssueStock.item;
      setPackingLines((prev) => [
        ...prev,
        {
          sku: it.sku,
          displayName: printMode === 'NICKNAME' ? it.nickname || it.name : it.name,
          unitCost: it.avgCost,
          qty: 1,
        },
      ]);
    },
  });
  const [closeWo] = useMutation(STORAGE_WORK_ORDER_CLOSE, { onCompleted: () => refetchWo() });
  const [reopenWoLine] = useMutation(STORAGE_WORK_ORDER_REOPEN, { onCompleted: () => refetchWo() });
  const [acceptTool] = useMutation(STORAGE_TOOL_ACCEPT, { onCompleted: () => refetchTools() });
  const [autoReconcileVat] = useMutation(STORAGE_VAT_AUTO_RECONCILE, { onCompleted: () => refetchVat() });
  const [manualReconcileVat] = useMutation(STORAGE_VAT_MANUAL_RECONCILE, {
    onCompleted: () => {
      setSelectedPayables([]);
      setSelectedReceipt('');
      refetchVat();
    },
  });

  const items = itemsData?.storageItems || [];
  const workOrders = woData?.storageWorkOrders || [];
  const tools = toolsData?.storageToolAssets || [];
  const payables = vatData?.storageVatPayables || [];
  const receipts = vatData?.storageEBarimtReceipts || [];
  const printPages = printerType === 'DOT_MATRIX_13' ? chunkForDotMatrix(packingLines, 13) : [packingLines];

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <IconPackage />
          <span className="font-medium">Ухаалаг Агуулах, Төсөл, Бүтээц & НӨАТ</span>
        </PageHeader.Start>
        <PageHeader.End>
          <select className="border rounded px-2 py-1 text-sm" value={company} onChange={(e) => setCompany(e.target.value)}>
            <option value="">Бүх өртгийн төв</option>
            <option value="Маймонсоорс ХХК">Маймонсоорс ХХК</option>
            <option value="Эм Эм Эс Инженеринг">Эм Эм Эс Инженеринг</option>
            <option value="Ар Жэй И Монголиа">Ар Жэй И Монголиа</option>
            <option value="Авандра ХХК">Авандра ХХК</option>
          </select>
        </PageHeader.End>
      </PageHeader>
      <div className="flex-auto overflow-auto p-6">
        <Tabs defaultValue="warehouse">
          <Tabs.List>
            <Tabs.Trigger value="warehouse">Агуулах (RFID vs Задгай) & Принтер</Tabs.Trigger>
            <Tabs.Trigger value="rfid">RFID Антен Скан</Tabs.Trigger>
            <Tabs.Trigger value="workorders">Ажлын захиалга (ББӨ хаалт)</Tabs.Trigger>
            <Tabs.Trigger value="tools">Бүтээц & Эзэмшигч (Түр зөрүү)</Tabs.Trigger>
            <Tabs.Trigger value="vat">НӨАТ Тулгалт (Авто / Гар)</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="warehouse" className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-3 items-center justify-between border p-3 rounded-lg">
              <div className="flex gap-2 items-center text-sm">
                <span>Нэршил:</span>
                <Button size="sm" variant={printMode === 'NICKNAME' ? 'default' : 'outline'} onClick={() => setPrintMode('NICKNAME')}>Оюу Толгой (Nickname)</Button>
                <Button size="sm" variant={printMode === 'NAME' ? 'default' : 'outline'} onClick={() => setPrintMode('NAME')}>Дотоод нэр</Button>
              </div>
              <div className="flex gap-2 items-center text-sm">
                <span>Принтер:</span>
                <Button size="sm" variant={printerType === 'DOT_MATRIX_13' ? 'default' : 'outline'} onClick={() => setPrinterType('DOT_MATRIX_13')}>Цэгэн принтер (13 мөр/хуудас)</Button>
                <Button size="sm" variant={printerType === 'A4' ? 'default' : 'outline'} onClick={() => setPrinterType('A4')}>А4 (Хязгааргүй)</Button>
              </div>
            </div>

            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>SKU / Нэр</Table.Head>
                  <Table.Head>ОТ Нэршил</Table.Head>
                  <Table.Head>Битүү (RFID)</Table.Head>
                  <Table.Head>Задгай</Table.Head>
                  <Table.Head>Өртөг</Table.Head>
                  <Table.Head>Үйлдэл</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {items.map((it: any) => (
                  <Table.Row key={it._id}>
                    <Table.Cell>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{it.sku}</div>
                    </Table.Cell>
                    <Table.Cell className="text-xs">{it.nickname || '-'}</Table.Cell>
                    <Table.Cell><Badge variant={it.useRfid ? 'default' : 'secondary'}>{it.sealedPacks} хайрцаг ({it.packSize}ш)</Badge></Table.Cell>
                    <Table.Cell>{it.openUnits} ш</Table.Cell>
                    <Table.Cell>{fmt(it.avgCost)}</Table.Cell>
                    <Table.Cell className="flex gap-1">
                      <Button size="sm" variant="outline" disabled={it.sealedPacks < 1} onClick={() => breakBox({ variables: { itemId: it._id } })}>1 хайрцаг задлах</Button>
                      <Button size="sm" onClick={() => issueStock({ variables: { itemId: it._id, qty: 1, workOrderCode: '26024', autoConvert: true } })}>Зарлагадах</Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {packingLines.length > 0 && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">Хэвлэхэд бэлэн Падаан ({printPages.length} хуудас — {printerType === 'DOT_MATRIX_13' ? 'Цэгэн принтер 13 мөр' : 'А4'})</h4>
                  <Button size="sm" onClick={() => window.print()}>Хэвлэх</Button>
                </div>
                {printPages.map((pg, idx) => (
                  <div key={idx} className="border p-2 rounded text-xs">
                    <div className="font-semibold mb-1">Хуудас {idx + 1} / {printPages.length}</div>
                    {pg.map((ln, i) => (
                      <div key={i} className="flex justify-between py-0.5 border-b last:border-0">
                        <span>{ln.sku} — {ln.displayName}</span>
                        <span>{ln.qty} ш × {fmt(ln.unitCost)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content value="rfid" className="space-y-4 pt-4">
            <Button onClick={() => runRfidScan()}>Антен ажиллуулах (2 мин скан)</Button>
            {rfidData?.storageRfidScan && (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Бараа</Table.Head>
                    <Table.Head>EPC-98 ID</Table.Head>
                    <Table.Head>Системд</Table.Head>
                    <Table.Head>Антен уншсан</Table.Head>
                    <Table.Head>Задгай бүс</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {rfidData.storageRfidScan.map((r: any) => (
                    <Table.Row key={r.itemId}>
                      <Table.Cell>{r.name}</Table.Cell>
                      <Table.Cell className="font-mono text-xs">{r.sampleEpc98 || '-'}</Table.Cell>
                      <Table.Cell>{r.systemPacks}</Table.Cell>
                      <Table.Cell className="font-bold">{r.scannedPacks}</Table.Cell>
                      <Table.Cell>{r.openUnits} ш</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Tabs.Content>

          <Tabs.Content value="workorders" className="space-y-4 pt-4">
            {workOrders.map((wo: any) => (
              <div key={wo._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <Badge>#{wo.code}</Badge> <span className="font-bold ml-2">{wo.name}</span>
                    <div className="text-xs text-muted-foreground">{wo.clientName}</div>
                  </div>
                  <Button size="sm" onClick={() => closeWo({ variables: { workOrderId: wo._id, percent: 30 } })}>Үлдэгдлийн 30% ББӨ рүү хаах</Button>
                </div>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>АЗ Татвар код</Table.Head>
                      <Table.Head>Тайлбар</Table.Head>
                      <Table.Head>Нийт дүн</Table.Head>
                      <Table.Head>ББӨ рүү хаасан</Table.Head>
                      <Table.Head>Үйлдэл</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {wo.costLines.map((ln: any) => (
                      <Table.Row key={ln._id}>
                        <Table.Cell><Badge variant="secondary">{ln.taxCode}</Badge></Table.Cell>
                        <Table.Cell>{ln.description}</Table.Cell>
                        <Table.Cell>{fmt(ln.totalAmount)}</Table.Cell>
                        <Table.Cell className="font-semibold">{fmt(ln.closedAmount)}</Table.Cell>
                        <Table.Cell>
                          {ln.closedAmount > 0 && (
                            <Button size="sm" variant="outline" onClick={() => reopenWoLine({ variables: { workOrderId: wo._id, costLineId: ln._id } })}>Буцааж нээх</Button>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            ))}
          </Tabs.Content>

          <Tabs.Content value="tools" className="space-y-4 pt-4">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Багаж</Table.Head>
                  <Table.Head>Эзэмшигч</Table.Head>
                  <Table.Head>Төлөв</Table.Head>
                  <Table.Head>Санхүү элэгдэл</Table.Head>
                  <Table.Head>Татвар элэгдэл</Table.Head>
                  <Table.Head>Түр зөрүү</Table.Head>
                  <Table.Head>Үйлдэл</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {tools.map((t: any) => {
                  const finDep = t.status === 'IN_WAREHOUSE' ? 0 : (t.cost / (t.finLifeYears * 12)) * t.monthsUsed;
                  const taxDep = t.status === 'IN_WAREHOUSE' ? 0 : (t.cost / (t.taxLifeYears * 12)) * t.monthsUsed;
                  return (
                    <Table.Row key={t._id}>
                      <Table.Cell>{t.name} ({t.assetCode})</Table.Cell>
                      <Table.Cell>
                        {t.custodianName}
                        {t.pendingCustodian && <div className="text-xs font-bold">→ Хүлээж буй: {t.pendingCustodian}</div>}
                      </Table.Cell>
                      <Table.Cell><Badge>{t.status}</Badge></Table.Cell>
                      <Table.Cell>{fmt(finDep)}</Table.Cell>
                      <Table.Cell>{fmt(taxDep)}</Table.Cell>
                      <Table.Cell className="font-bold">{fmt(finDep - taxDep)}</Table.Cell>
                      <Table.Cell>
                        {t.status === 'PENDING_HANDOVER' && (
                          <Button size="sm" onClick={() => acceptTool({ variables: { toolId: t._id } })}>Хүлээн авлаа (OK)</Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Tabs.Content>

          <Tabs.Content value="vat" className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Button onClick={() => autoReconcileVat()}>Автомат тулгалт хийх (TIN + Дүн)</Button>
              <Button
                variant="outline"
                disabled={selectedPayables.length === 0 || !selectedReceipt}
                onClick={() => manualReconcileVat({ variables: { payableIds: selectedPayables, receiptId: selectedReceipt } })}
              >
                Сонгосон баримтуудыг гараар тулгах
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <h4 className="font-semibold mb-2 text-sm">Өглөгийн бүртгэл (Хэрэгжээгүй НӨАТ)</h4>
                {payables.map((p: any) => (
                  <div
                    key={p._id}
                    onClick={() =>
                      p.status === 'UNMATCHED' &&
                      setSelectedPayables((prev) => (prev.includes(p._id) ? prev.filter((x) => x !== p._id) : [...prev, p._id]))
                    }
                    className={`p-2 border rounded mb-1 text-xs cursor-pointer flex justify-between ${
                      p.status === 'MATCHED' ? 'bg-emerald-50' : selectedPayables.includes(p._id) ? 'bg-sky-50 border-sky-500' : ''
                    }`}
                  >
                    <span>{p.vendorName} ({p.vendorTin}) — {p.isPaid ? 'Төлөгдсөн (YES)' : 'Төлөгдөөгүй (NO)'}</span>
                    <span className="font-bold">{fmt(p.vatAmount)}</span>
                  </div>
                ))}
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-semibold mb-2 text-sm">e-Barimt баримтууд</h4>
                {receipts.map((r: any) => (
                  <div
                    key={r._id}
                    onClick={() => r.status === 'UNMATCHED' && setSelectedReceipt(r._id)}
                    className={`p-2 border rounded mb-1 text-xs cursor-pointer flex justify-between ${
                      r.status === 'MATCHED' ? 'bg-emerald-50' : selectedReceipt === r._id ? 'bg-sky-50 border-sky-500' : ''
                    }`}
                  >
                    <span>{r.receiptNo} — {r.vendorName} ({r.vendorTin})</span>
                    <span className="font-bold">{fmt(r.vatAmount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Tabs.Content>
        </Tabs>
      </div>
    </div>
  );
};

