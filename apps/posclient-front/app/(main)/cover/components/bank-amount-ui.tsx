import {
  coverStatusAtom,
  coverValidationAttemptedAtom,
  terminalFetchBusyAtom,
  terminalResultsAtom,
} from "@/store/cover.store"
import { useAtomValue } from "jotai"
import { DownloadCloudIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { CoverBlock } from "./cover-ui"

export const BankAmountUi = ({
  name,
  type,
  getCover,
  loading,
}: {
  name?: string
  type: string
  getCover?: () => void
  loading?: boolean
}) => {
  const results = useAtomValue(terminalResultsAtom).filter(
    (entry) => entry.bank === type
  )
  const status = useAtomValue(coverStatusAtom)
  const busy = useAtomValue(terminalFetchBusyAtom)
  const attempted = useAtomValue(coverValidationAttemptedAtom)
  const invalid =
    attempted && !results.some((result) => !!result.response?.trim())
  const descriptionId = `cover-terminal-description-${type}`
  const disabled = busy || status === "confirm" || status === "confirming"
  return (
    <CoverBlock
      title={name}
      description="Терминалын өдрийн хаалт"
      action={
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 rounded px-2.5 text-[13px] font-medium"
          loading={loading}
          onClick={getCover}
          disabled={disabled || !getCover}
        >
          {!loading && <DownloadCloudIcon className="h-4 w-4" />}
          Терминалаас татах
        </Button>
      }
    >
      <div className="space-y-1.5">
        <Label
          htmlFor={descriptionId}
          className="block text-xs text-muted-foreground"
        >
          Терминалын тэмдэглэл <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id={descriptionId}
          aria-required="true"
          aria-invalid={invalid}
          aria-describedby={invalid ? `${descriptionId}-error` : undefined}
          className={cn(
            "min-h-24 rounded-sm border-0 bg-muted/60 font-mono text-xs shadow-none",
            invalid && "shadow-focus-destructive"
          )}
          placeholder="Терминалаас хаалт татахад хариу энд харагдана"
          value={results
            .map(
              (entry) =>
                `${entry.createdAt}\n${
                  entry.response ?? "Хариу хүлээгдэж байна"
                }`
            )
            .join("\n\n")}
          readOnly
          rows={5}
        />
        {invalid && (
          <p
            id={`${descriptionId}-error`}
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            Терминалаас хаалт татаж, тэмдэглэлийг бөглөнө үү.
          </p>
        )}
      </div>
    </CoverBlock>
  )
}
