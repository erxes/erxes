import type { ComponentType, ReactNode } from 'react';
import type { TPluginListType } from '../list/ViewBar';
import { hostComponent } from '../../utils/host-component';

/** What `Import` takes: the plugin record type its manifest's `transfer` declares. */
interface ImportProps {
  /** `<plugin>:<record>` (`accounting:account`). */
  recordType: TPluginListType;
  /** The popover's heading; "Upload CSV" by default. */
  title?: string;
  /** More about the file, under the heading: a guide to its columns. */
  children?: ReactNode;
}

/** One value of a list's own filter, as its address keeps it. */
type FilterValue = string | number | boolean | null | string[];

/** What `Export` takes: the record type, and which of its records. */
interface ExportProps {
  /** `<plugin>:<record>` (`accounting:transaction`). */
  recordType: TPluginListType;
  buttonVariant?: 'outline' | 'secondary' | 'ghost';
  /** Only these records: the rows the member selected. */
  ids?: string[];
  /** The list's own filter, handed to the plugin's export as `query.params`. */
  getFilters?: () => Record<string, FilterValue>;
}

const importer = hostComponent<ImportProps>();
const exporter = hostComponent<ExportProps>();

/** The host's import and export buttons, which `Import` and `Export` render. */
export interface TransferButtons {
  Import: ComponentType<ImportProps>;
  Export: ComponentType<ExportProps>;
}

/** Registers core's import and export buttons; plugins don't call it. */
export const setTransferButtons = (buttons: TransferButtons | null) => {
  importer.set(buttons?.Import ?? null);
  exporter.set(buttons?.Export ?? null);
};

/**
 * An Import button for a plugin's records, through core's import.
 * It looks as 3.x's `Import` did. Its popover uploads a CSV or Excel file into core's import (the mapping, the check, the run
 * and the history are core's), and lists this type's imports running now. It shows for members
 * with the type's `importPermission`; outside erxes it renders nothing.
 */
export const Import = importer.Host;

/**
 * An Export button for a plugin's records, through core's export.
 * It looks as 3.x's `Export` did. It picks the columns and the format, then core asks the plugin for the rows (`ids`, else
 * `getFilters()` as `query.params`) in the background; beside it, this type's recent exports.
 */
export const Export = exporter.Host;
