# Mongolian Modules

**Backend root:** `backend/plugins/mongolian_api/src/modules/`
**Frontend root:** `frontend/plugins/mongolian_ui/src/`

## Sub-modules

### Ebarimt (VAT Receipts)
Integration with the Mongolian Tax Authority (MTA/Ebarimt).
- **Entities:** `Ebarimt`, `ProductGroup`, `ProductRule`
- **Mechanics:** 
  - Exposes an RPC/GraphQL mutation to `putEbarimt`.
  - When POS or Sales calls this, the plugin contacts the Ebarimt gateway to generate a receipt with a QR code and lottery number.
  - Returns the receipt data to the caller to be printed.

### Exchange Rates
Daily currency exchange rates from Mongolbank.
- **Entities:** `ExchangeRates`
- **Mechanics:** A background cron job fetches the daily rates and stores them. Accounting uses this for multi-currency ledger entries.

### MS Dynamic
Sync mechanism with Microsoft Dynamics (popular ERP in Mongolia).
- **Entities:** `Dynamic`
