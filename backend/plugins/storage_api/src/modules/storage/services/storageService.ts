import { IModels } from '../db/models/Storage';

export class StorageService {
  static async assertPeriodOpen(models: IModels, txDate: Date) {
    const latestClose = await models.PeriodCloses.findOne({ status: 'CLOSED' }).sort({ closedUntil: -1 });
    if (latestClose && txDate <= latestClose.closedUntil) {
      throw new Error(
        `Тухайн огноо (${txDate.toISOString().slice(0, 10)}) нь хаалт хийгдсэн хугацаанд байна. Эхлээд хаалтыг нээнэ үү.`
      );
    }
  }

  static async receiveStock(
    models: IModels,
    params: { itemId: string; sealedPacks: number; openUnits: number; txDate?: Date }
  ) {
    const date = params.txDate ? new Date(params.txDate) : new Date();
    await this.assertPeriodOpen(models, date);
    const item = await models.StorageItems.findById(params.itemId);
    if (!item) throw new Error('Бараа олдсонгүй.');
    item.sealedPacks += params.sealedPacks;
    item.openUnits += params.openUnits;
    if (item.useRfid && params.sealedPacks > 0) {
      const tags = Array.from({ length: params.sealedPacks }).map((_, i) => ({
        epcId: `EPC98-${item.sku}-${Date.now().toString(36).toUpperCase()}-${i + 1}`.slice(0, 98),
        itemId: String(item._id),
        unitsInPack: item.packSize,
        tagCost: 175,
        zoneStatus: 'SEALED' as const,
      }));
      await models.RfidTags.insertMany(tags);
    }
    const notifiedUsers = [...item.pendingPrUsers];
    item.pendingPrUsers = [];
    await item.save();
    return { item, notifiedUsers };
  }

  static async breakSealedBox(models: IModels, itemId: string) {
    const item = await models.StorageItems.findById(itemId);
    if (!item || item.sealedPacks < 1) throw new Error('Задлах битүү хайрцаг үлдэгдэлгүй байна.');
    item.sealedPacks -= 1;
    item.openUnits += item.packSize;
    await item.save();
    await models.RfidTags.findOneAndUpdate(
      { itemId: String(item._id), zoneStatus: 'SEALED' },
      { $set: { zoneStatus: 'OPENED' } }
    );
    return item;
  }

  private static async deductUnits(models: IModels, item: any, qty: number) {
    let remaining = qty;
    const takeOpen = Math.min(item.openUnits, remaining);
    item.openUnits -= takeOpen;
    remaining -= takeOpen;
    if (remaining > 0) {
      const packsToBreak = Math.ceil(remaining / item.packSize);
      if (item.sealedPacks < packsToBreak) throw new Error(`"${item.name}" барааны үлдэгдэл хүрэлцэхгүй байна.`);
      item.sealedPacks -= packsToBreak;
      item.openUnits += packsToBreak * item.packSize - remaining;
      for (let i = 0; i < packsToBreak; i++) {
        await models.RfidTags.findOneAndUpdate({ itemId: String(item._id), zoneStatus: 'SEALED' }, { $set: { zoneStatus: 'OPENED' } });
      }
    }
    await item.save();
  }

  static async issueStock(
    models: IModels,
    params: { itemId: string; qty: number; workOrderCode?: string; taxCode?: string; directDrop?: boolean; autoConvert?: boolean; txDate?: Date }
  ) {
    const date = params.txDate ? new Date(params.txDate) : new Date();
    await this.assertPeriodOpen(models, date);
    const item = await models.StorageItems.findById(params.itemId);
    if (!item) throw new Error('Бараа олдсонгүй.');
    let totalAvail = item.sealedPacks * item.packSize + item.openUnits;
    if (!params.directDrop && totalAvail < params.qty && params.autoConvert) {
      const kitCard = await models.TechCards.findOne({ kitItemId: String(item._id) });
      if (kitCard) {
        const needed = params.qty - totalAvail;
        for (const comp of kitCard.components) {
          const cp = await models.StorageItems.findById(comp.itemId);
          if (!cp) throw new Error('Бүрэлдэхүүн эд анги олдсонгүй.');
          await this.deductUnits(models, cp, comp.qty * needed);
        }
        item.openUnits += needed;
        await item.save();
        totalAvail += needed;
      } else {
        const partCard = await models.TechCards.findOne({ 'components.itemId': String(item._id) });
        if (partCard) {
          const kitItem = await models.StorageItems.findById(partCard.kitItemId);
          const compDef = partCard.components.find((c) => c.itemId === String(item._id))!;
          const kitsToBreak = Math.ceil((params.qty - totalAvail) / compDef.qty);
          if (kitItem && kitItem.sealedPacks * kitItem.packSize + kitItem.openUnits >= kitsToBreak) {
            await this.deductUnits(models, kitItem, kitsToBreak);
            for (const comp of partCard.components) {
              const cp = await models.StorageItems.findById(comp.itemId);
              if (cp) { cp.openUnits += comp.qty * kitsToBreak; await cp.save(); }
            }
            const refreshed = await models.StorageItems.findById(params.itemId);
            if (refreshed) item.openUnits = refreshed.openUnits;
          }
        }
      }
    }
    if (!params.directDrop) await this.deductUnits(models, item, params.qty);
    if (params.workOrderCode) {
      await models.WorkOrders.findOneAndUpdate(
        { code: params.workOrderCode },
        { $push: { costLines: { date, category: 'MATERIAL', taxCode: params.taxCode || 'АЗ-54', itemId: String(item._id), description: item.name, qty: params.qty, unitCost: item.avgCost, totalAmount: params.qty * item.avgCost, closedAmount: 0, directDrop: Boolean(params.directDrop) } } }
      );
    }
    if (item.itemType === 'TOOL_ASSET') {
      await models.ToolAssets.create({
        assetCode: `TOOL-${Date.now().toString().slice(-6)}`,
        name: item.name,
        serialNo: `SN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        cost: item.avgCost,
        finLifeYears: 5,
        taxLifeYears: 10,
        monthsUsed: 0,
        status: 'PENDING_HANDOVER',
        custodianName: 'Төв нярав',
        pendingCustodian: params.workOrderCode ? `Төсөл #${params.workOrderCode} хариуцагч` : 'Хэрэглэгч',
        workOrderCode: params.workOrderCode || null,
        repairExpense: 0,
      });
    }
    return item;
  }

  static async closeWorkOrderPercent(models: IModels, workOrderId: string, percent: number) {
    const wo = await models.WorkOrders.findById(workOrderId);
    if (!wo) throw new Error('Ажлын захиалга олдсонгүй.');
    const ratio = Math.max(0, Math.min(100, percent)) / 100;
    for (const line of wo.costLines) {
      const remaining = line.totalAmount - line.closedAmount;
      if (remaining > 0) line.closedAmount += Math.round(remaining * ratio);
    }
    await wo.save();
    return wo;
  }

  static async reopenWorkOrderClose(models: IModels, workOrderId: string, costLineId: string) {
    const wo = await models.WorkOrders.findById(workOrderId);
    if (!wo) throw new Error('Ажлын захиалга олдсонгүй.');
    const line = wo.costLines.find((l) => String(l._id) === costLineId);
    if (!line) throw new Error('Зардлын мөр олдсонгүй.');
    line.closedAmount = 0;
    await wo.save();
    return wo;
  }

  static async acceptToolHandover(models: IModels, toolId: string) {
    const tool = await models.ToolAssets.findById(toolId);
    if (!tool || tool.status !== 'PENDING_HANDOVER' || !tool.pendingCustodian) throw new Error('Хүлээн зөвшөөрөх хүсэлт алга байна.');
    const isWarehouse = tool.pendingCustodian.includes('нярав');
    tool.custodianName = tool.pendingCustodian;
    tool.pendingCustodian = null;
    tool.status = isWarehouse ? 'IN_WAREHOUSE' : 'IN_USE';
    if (isWarehouse) tool.workOrderCode = null;
    await tool.save();
    return tool;
  }

  static async autoReconcileVat(models: IModels) {
    const payables = await models.VatPayables.find({ status: 'UNMATCHED' });
    const receipts = await models.EBarimtReceipts.find({ status: 'UNMATCHED' });
    let matchedCount = 0;
    for (const r of receipts) {
      const match = payables.find((p) => p.status === 'UNMATCHED' && p.vendorTin === r.vendorTin && Math.abs(p.vatAmount - r.vatAmount) < 1);
      if (match) {
        const groupId = `VAT-AUTO-${Date.now()}-${matchedCount}`;
        match.status = 'MATCHED';
        match.matchedGroupId = groupId;
        r.status = 'MATCHED';
        r.matchedGroupId = groupId;
        await Promise.all([match.save(), r.save()]);
        matchedCount++;
      }
    }
    return matchedCount;
  }

  static async manualReconcileVat(models: IModels, payableIds: string[], receiptId: string) {
    const receipt = await models.EBarimtReceipts.findById(receiptId);
    const payables = await models.VatPayables.find({ _id: { $in: payableIds }, status: 'UNMATCHED' });
    if (!receipt || payables.length === 0) throw new Error('Тулгах баримт олдсонгүй.');
    const sumVat = payables.reduce((s, p) => s + p.vatAmount, 0);
    if (Math.abs(sumVat - receipt.vatAmount) > 5) throw new Error(`НӨАТ-ын дүн зөрүүтэй байна: Өглөг=${sumVat}, e-Barimt=${receipt.vatAmount}`);
    const groupId = `VAT-MAN-${Date.now()}`;
    receipt.status = 'MATCHED';
    receipt.matchedGroupId = groupId;
    await receipt.save();
    await models.VatPayables.updateMany({ _id: { $in: payableIds } }, { $set: { status: 'MATCHED', matchedGroupId: groupId } });
    return groupId;
  }
}
