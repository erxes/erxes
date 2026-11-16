import { gql } from '@apollo/client';

export const STORAGE_ITEMS_QUERY = gql`
  query storageItems($company: String) {
    storageItems(company: $company) {
      _id sku barcode name nickname itemType useRfid packSize avgCost sealedPacks openUnits
      costCenter { company branch department }
    }
  }
`;

export const STORAGE_RFID_SCAN_QUERY = gql`
  query storageRfidScan {
    storageRfidScan { itemId sku name systemPacks scannedPacks openUnits sampleEpc }
  }
`;

export const STORAGE_WORK_ORDERS_QUERY = gql`
  query storageWorkOrders {
    storageWorkOrders {
      _id code name clientName contractNo status
      costLines { _id date category taxCode description qty unitCost totalAmount closedAmount directDrop }
    }
  }
`;

export const STORAGE_TOOL_ASSETS_QUERY = gql`
  query storageToolAssets {
    storageToolAssets {
      _id assetCode name serialNo cost finLifeYears taxLifeYears inServiceDate monthsUsed status
      custodianName pendingCustodian pendingToWarehouse workOrderCode repairExpense
    }
  }
`;

export const STORAGE_VAT_DATA_QUERY = gql`
  query storageVatData {
    storageVatPayables { _id vendorTin vendorName amount vatAmount isPaid status matchedGroupId }
    storageEBarimtReceipts { _id receiptNo vendorTin vendorName amount vatAmount status matchedGroupId }
  }
`;

export const STORAGE_BREAK_SEALED_BOX = gql`
  mutation storageBreakSealedBox($itemId: String!, $epcId: String, $requestKey: String) {
    storageBreakSealedBox(itemId: $itemId, epcId: $epcId, requestKey: $requestKey) { _id sealedPacks openUnits }
  }
`;

export const STORAGE_ISSUE_STOCK = gql`
  mutation storageIssueStock($itemId: String!, $qty: Float!, $workOrderCode: String, $taxCode: String, $directDrop: Boolean, $autoConvert: Boolean, $requestKey: String) {
    storageIssueStock(itemId: $itemId, qty: $qty, workOrderCode: $workOrderCode, taxCode: $taxCode, directDrop: $directDrop, autoConvert: $autoConvert, requestKey: $requestKey) {
      docNo
      item { _id name nickname sku avgCost sealedPacks openUnits }
    }
  }
`;

export const STORAGE_WORK_ORDER_CLOSE = gql`
  mutation storageWorkOrderClosePercent($workOrderId: String!, $percent: Float!, $requestKey: String) { storageWorkOrderClosePercent(workOrderId: $workOrderId, percent: $percent, requestKey: $requestKey) { _id } }
`;

export const STORAGE_WORK_ORDER_REOPEN = gql`
  mutation storageWorkOrderReopenLine($workOrderId: String!, $costLineId: String!, $requestKey: String) { storageWorkOrderReopenLine(workOrderId: $workOrderId, costLineId: $costLineId, requestKey: $requestKey) { _id } }
`;

export const STORAGE_TOOL_ACCEPT = gql`
  mutation storageToolAcceptHandover($toolId: String!) { storageToolAcceptHandover(toolId: $toolId) { _id status custodianName pendingCustodian } }
`;

export const STORAGE_VAT_AUTO_RECONCILE = gql`mutation storageVatAutoReconcile { storageVatAutoReconcile }`;

export const STORAGE_VAT_MANUAL_RECONCILE = gql`
  mutation storageVatManualReconcile($payableIds: [String!]!, $receiptId: String!) { storageVatManualReconcile(payableIds: $payableIds, receiptId: $receiptId) }
`;
