import {
  coverStatusAtom,
  descriptionAtom,
  markCoverEditedAtom,
  terminalFetchBusyAtom,
} from "@/store/cover.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useCoverTerminalFetch } from "../hooks/useCoverTerminalFetch"

export const Description = () => {
  const [description, setDescription] = useAtom(descriptionAtom)
  const markEdited = useSetAtom(markCoverEditedAtom)
  const status = useAtomValue(coverStatusAtom)
  const busy = useAtomValue(terminalFetchBusyAtom)
  const { pending, retryPending, loading } = useCoverTerminalFetch()
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor="cover-description"
        className="block text-xs text-muted-foreground"
      >
        Тэмдэглэл
      </Label>
      <div className="space-y-3">
        <Textarea
          id="cover-description"
          className="min-h-20 resize-none rounded-sm border-0 bg-muted/60 px-2 text-[13px] shadow-none transition-[background-color,box-shadow] placeholder:text-zinc-400 hover:bg-accent focus-visible:bg-background focus-visible:shadow-focus"
          placeholder="Хаалттай холбоотой нэмэлт тайлбар"
          rows={3}
          value={description ?? ""}
          disabled={busy || status === "confirm" || status === "confirming"}
          onChange={(e) => {
            setDescription(e.target.value)
            markEdited()
          }}
        />
        {loading && (
          <p role="status" className="text-xs text-muted-foreground">
            Терминалын хүсэлт боловсруулагдаж байна...
          </p>
        )}
        {pending && !loading && (
          <div
            role="alert"
            className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900"
          >
            <p>
              Терминалын үр дүн хадгалагдаж дуусаагүй. Дахин терминал
              дуудахгүйгээр хадгална уу.
            </p>
            {!pending.response && (
              <p>
                Хүсэлт тасарсан тул терминал дээр хаалт хийгдсэн эсэхийг шалгана
                уу. Тасарсан хүсэлтийг тодорхойгүй үр дүнтэйгээр бүртгэнэ.
              </p>
            )}
            <Button size="sm" onClick={retryPending} loading={loading}>
              {pending.response
                ? "Үр дүнг дахин хадгалах"
                : "Тасарсан хүсэлтийг бүртгэх"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
