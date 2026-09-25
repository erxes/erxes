import { toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { RefObject, useCallback, useState } from 'react';
import {
  directPrintEnabledState,
  directPrinterState,
} from 'ui-modules/modules/documents/states/printSettings';
import { PrintFormValues } from 'ui-modules/modules/documents/types/print';
import * as utils from 'ui-modules/modules/documents/utils';
import {
  QZ_NOT_RUNNING_MESSAGE,
  ensureQzConnected,
  printPagesToQz,
} from 'ui-modules/modules/documents/utils/qzTray';

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const usePrintJob = ({
  iframeRef,
  getValues,
}: {
  iframeRef: RefObject<HTMLIFrameElement>;
  getValues: () => PrintFormValues;
}) => {
  const [isRunning, setIsRunning] = useState(false);

  const directPrint = useAtomValue(directPrintEnabledState);
  const printer = useAtomValue(directPrinterState);

  const run = useCallback(
    (
      title: string,
      action: (iframe: HTMLIFrameElement) => Promise<void>,
    ): void => {
      const iframe = iframeRef.current;

      if (!iframe) {
        return;
      }

      const start = async () => {
        setIsRunning(true);

        try {
          await action(iframe);
        } catch (error) {
          toast({
            title,
            description: describeError(error),
            variant: 'destructive',
          });
        } finally {
          setIsRunning(false);
        }
      };

      if (iframe.dataset.printReady === 'true') {
        void start();
        return;
      }

      const onLoad = () => {
        iframe.removeEventListener('load', onLoad);
        void start();
      };

      iframe.addEventListener('load', onLoad);
    },
    [iframeRef],
  );

  const prepare = async (iframe: HTMLIFrameElement) => {
    const values = getValues();

    await utils.waitForImages(iframe);

    utils.transformLabels(iframe, values);
    utils.syncPageHeight(iframe, values);

    return values;
  };

  const print = () =>
    run('Print failed', async (iframe) => {
      const values = await prepare(iframe);

      const openDialog = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };

      if (!directPrint || !printer) {
        openDialog();
        return;
      }

      if (!(await ensureQzConnected())) {
        toast({ title: QZ_NOT_RUNNING_MESSAGE });
        openDialog();
        return;
      }

      await printPagesToQz({
        printer,
        pages: utils.buildLabelPages(iframe, values),
      });

      toast({ title: 'Sent to printer' });
    });

  return { isRunning, print };
};
