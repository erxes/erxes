import { IconEditCircle, IconEyeCheck } from '@tabler/icons-react';
import { Button, Input, Label, Separator } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMemo, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { TR_SIDES } from '~/modules/transactions/types/constants';
import { followTrDocsState } from '../../states/trStates';
import { ICommonFieldProps } from '../../types/JournalForms';

export const RelAccountsForm = ({ form, index }: ICommonFieldProps) => {
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${index}`,
  });

  const trDocs = useWatch({
    control: form.control,
    name: `trDocs`,
  });

  const followTrDocs = useAtomValue(followTrDocsState);

  const { dtCodes, ctCodes } = useMemo(() => {
    const dtAccountCodes: string[] = [];
    const ctAccountCodes: string[] = [];
    (trDocs || []).forEach((activeTr) => {
      if (activeTr._id === trDoc._id) {
        return;
      }
      if (activeTr.ptrId !== trDoc.ptrId) {
        return;
      }

      if (activeTr.side === TR_SIDES.DEBIT) {
        activeTr.details.forEach((detail) => {
          const code = detail.account?.code ?? '';
          if (!code || dtAccountCodes.includes(code)) {
            return;
          }
          dtAccountCodes.push(code);
        });
      } else {
        activeTr.details.forEach((detail) => {
          const code = detail.account?.code ?? '';
          if (!code || ctAccountCodes.includes(code)) {
            return;
          }
          ctAccountCodes.push(code);
        });
      }
    });

    (followTrDocs || []).forEach((ftr) => {
      if (ftr.ptrId !== trDoc.ptrId) {
        return;
      }

      if (ftr.side === TR_SIDES.DEBIT) {
        ftr.details.forEach((detail) => {
          const code = detail.account?.code ?? '';
          if (!code || dtAccountCodes.includes(code)) {
            return;
          }
          dtAccountCodes.push(code);
        });
      } else {
        ftr.details.forEach((detail) => {
          const code = detail.account?.code ?? '';
          if (!code || ctAccountCodes.includes(code)) {
            return;
          }
          ctAccountCodes.push(code);
        });
      }
    });
    return {
      dtCodes: dtAccountCodes,
      ctCodes: ctAccountCodes,
    };
  }, [trDocs, followTrDocs, trDoc._id, trDoc.ptrId]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [customDts, setCustomDts] = useState<string[]>([
    ...(trDoc.relAccounts?.customDt || dtCodes),
    '',
  ]);
  const [customCts, setCustomCts] = useState<string[]>([
    ...(trDoc.relAccounts?.customDt || ctCodes),
    '',
  ]);

  const onChangeDt = (value: string, ind: number) => {
    const newValues = customDts.map((code, cInd) =>
      cInd === ind ? value : code,
    );

    setCustomDts(newValues);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const filtered = newValues.filter((code) => !!code);
      setCustomDts([...filtered, '']);

      form.setValue(`trDocs.${index}.relAccounts`, {
        ...trDoc.relAccounts,
        customDt: filtered.length ? filtered : null,
      });
    }, 900);
  };
  const onChangeCt = (value: string, ind: number) => {
    const newValues = customCts.map((code, cInd) =>
      cInd === ind ? value : code,
    );

    setCustomCts(newValues);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const filtered = newValues.filter((code) => !!code);
      setCustomCts([...filtered, '']);
      form.setValue(`trDocs.${index}.relAccounts`, {
        ...trDoc.relAccounts,
        customCt: filtered.length ? filtered : null,
      });
    }, 900);
  };

  if (!showEdit) {
    const dtStr = customDts.join(', ');
    const ctStr = customCts.join(', ');
    return (
      <div className="flex flex-auto">
        <Button
          variant="link"
          className="bg-border"
          onClick={() => setShowEdit(true)}
        >
          <IconEditCircle />
          {`Харилцсан данс засах`}
        </Button>
        {dtStr && <Label className="ml-1">Дебет: {dtStr}</Label>}
        {ctStr && <Label className="ml-1">Кредит: {ctStr}</Label>}
      </div>
    );
  }

  return (
    <>
      <Separator />
      <div className="flex flex-auto mt-2">
        <Label> Дебет:</Label>
        {customDts?.map((code, ind) => (
          <Input
            className="ml-4 max-w-36"
            key={code}
            value={code}
            onChange={(e) => onChangeDt(e.target.value, ind)}
          />
        ))}
      </div>
      <div className="flex flex-auto mt-2">
        <Label>Кредит:</Label>
        {customCts?.map((code, ind) => (
          <Input
            className="ml-4 max-w-36"
            key={code}
            value={code}
            onChange={(e) => onChangeCt(e.target.value, ind)}
          />
        ))}
      </div>
      <Button
        variant="link"
        className="bg-border mt-2 mb-2"
        onClick={() => setShowEdit(false)}
      >
        <IconEyeCheck />
        {`Хадгалаад хаах`}
      </Button>
      <Separator />
    </>
  );
};
