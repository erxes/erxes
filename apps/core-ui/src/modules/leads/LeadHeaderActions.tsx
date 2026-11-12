import type { LeadRecordType } from "@erxes/core-contract";
import { IconUserCheck } from "@tabler/icons-react";
import { Button, Tooltip } from "erxes-ui";
import { useState } from "react";
import { ConvertDialog } from "./LeadActions";
import type { LeadRecord } from "./useLeads";
import { useLeadsT } from "./i18n";

/** A lead's Convert in its record header: an icon, its name on hover. Nothing for customers. */
export const LeadHeaderActions = ({
  recordType,
  record,
}: {
  recordType: LeadRecordType;
  record?: LeadRecord | null;
}) => {
  const [converting, setConverting] = useState(false);
  const t = useLeadsT();

  if (!record || record.state !== "lead") return null;

  return (
    <>
      <Tooltip delayDuration={200}>
        <Tooltip.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-primary"
            aria-label={t("actions.convert-to-customer")}
            onClick={() => setConverting(true)}
          >
            <IconUserCheck className="size-4" />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>{t("actions.convert-to-customer")}</Tooltip.Content>
      </Tooltip>
      <ConvertDialog
        recordType={recordType}
        leads={[record]}
        open={converting}
        onOpenChange={setConverting}
      />
    </>
  );
};
