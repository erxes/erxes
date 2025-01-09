import { consumeRPCQueue } from "../messageBroker";

export const importExportCunsomers = ({ name, imports, exporter }) => {
  if (imports) {
    if (imports.prepareImportDocs) {
      consumeRPCQueue(`${name}:imports.prepareImportDocs`, async args => ({
        status: "success",
        data: await imports.prepareImportDocs(args)
      }));
    }

    if (imports.insertImportItems) {
      consumeRPCQueue(`${name}:imports.insertImportItems`, async args => ({
        status: "success",
        data: await imports.insertImportItems(args)
      }));
    }
  }

  if (exporter) {
    if (exporter.prepareExportData) {
      consumeRPCQueue(`${name}:exporter.prepareExportData`, async args => ({
        status: "success",
        data: await exporter.prepareExportData(args)
      }));
    }

    if (exporter.getExportDocs) {
      consumeRPCQueue(`${name}:exporter.getExportDocs`, async args => ({
        status: "success",
        data: await exporter.getExportDocs(args)
      }));
    }
  }
};
