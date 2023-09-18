import { calcAmountsAtom, currentAmountsAtom } from "@/store/cover.store"
import { useAtom } from "jotai"
import { DownloadCloudIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const BankAmountUi = ({
  name,
  type,
  getCover,
  loading,
  description,
  onDescriptionChange,
  descriptionDisabled,
}: {
  name?: string
  type: string
  getCover?: () => void
  loading?: boolean
  description?: string
  onDescriptionChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  descriptionDisabled?: boolean
}) => {
  const [calcAmounts] = useAtom(calcAmountsAtom)
  const [currentAmounts, setCurrentAmounts] = useAtom(currentAmountsAtom)
  const calcAmount = (calcAmounts || {})[type] || 0
  const currentAmount = (currentAmounts || {})[type] || 0

  return (
    <Card>
      <div className="flex flex-row items-center justify-between p-4 pt-3">
        <CardTitle>{name}</CardTitle>
        <Button
          variant="secondary"
          size="sm"
          loading={loading}
          onClick={getCover}
        >
          {!loading && (
            <DownloadCloudIcon className="mr-0.5 h-5 w-5 -translate-x-0.5" />
          )}
          Терминалаас хаалт татах
        </Button>
      </div>
      <CardContent>
        <div className="flex items-center space-x-2 pb-2">
          <div className="w-1/3 space-y-1">
            <Label>Систем дүн</Label>
            <Input disabled value={(calcAmounts || {})[type] || 0} />
          </div>
          <div className="w-1/3 space-y-1">
            <Label>Зөрүү</Label>
            <Input disabled value={calcAmount - currentAmount} type="number" />
          </div>
          <div className="w-1/3 space-y-1">
            <Label>Бүгд</Label>
            <Input
              value={currentAmount}
              onChange={(e) =>
                setCurrentAmounts({
                  ...currentAmounts,
                  [type]:
                    Number(e.target.value) > 0 ? Number(e.target.value) : 0,
                })
              }
              type="number"
            />
          </div>
        </div>
        <div className="w-full space-y-1">
          <Label>Tэмдэглэл</Label>
          <Textarea
            value={description}
            onChange={onDescriptionChange}
            disabled={descriptionDisabled}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default BankAmountUi
