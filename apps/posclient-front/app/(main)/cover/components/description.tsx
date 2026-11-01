import {
  coverStatusAtom,
  descriptionAtom,
  terminalFetchBusyAtom,
} from "@/store/cover.store"
import { useAtom, useAtomValue } from "jotai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useCoverTerminalFetch } from "../hooks/useCoverTerminalFetch"

export const Description = () => {
  const [description, setDescription] = useAtom(descriptionAtom)
  const status = useAtomValue(coverStatusAtom)
  const busy = useAtomValue(terminalFetchBusyAtom)
  const { pending, retryPending, loading } = useCoverTerminalFetch()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Хаалтын тэмдэглэл</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={description}
          disabled={busy || status === "confirm" || status === "confirming"}
          onChange={(e) => setDescription(e.target.value)}
        />
        {loading && (
          <p role="status">Терминалын хүсэлт боловсруулагдаж байна...</p>
        )}
        {pending && !loading && (
          <div role="alert" className="space-y-2">
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
            <Button onClick={retryPending} loading={loading}>
              {pending.response
                ? "Үр дүнг дахин хадгалах"
                : "Тасарсан хүсэлтийг бүртгэх"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
