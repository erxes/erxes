import { useEffect, useState } from "react"
import useCheckRegister from "@/modules/checkout/hooks/useCheckRegister"
import { registerNumberAtom } from "@/store/order.store"
import { useSetAtom } from "jotai"
import { CheckCircle2Icon, SearchIcon, XCircleIcon } from "lucide-react"

import useFocus from "@/lib/useFocus"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const REGISTER_PATTERN = /^[А-ЯЁӨҮ]{2}\d{8}$|^\d{7}$/

const CheckRegister = () => {
  const [current, setCurrent] = useState("")
  const [error, setError] = useState("")
  const setRegister = useSetAtom(registerNumberAtom)
  const { checkRegister, loading, data } = useCheckRegister()
  const { found, name } = data || {}
  const [htmlElRef, setFocus] = useFocus()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = current.trim().toUpperCase()
    if (!REGISTER_PATTERN.test(value)) {
      setError("Регистрийн дугаар буруу байна (7 оронтой тоо эсвэл АА12345678)")
      return
    }
    setError("")
    checkRegister({
      variables: {
        registerNumber: value,
      },
      onCompleted(data) {
        const { ordersCheckCompany } = data || {}
        if (ordersCheckCompany.found) {
          setRegister(value)
        }
      },
    })
  }

  useEffect(() => {
    setFocus()
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <Label
        className="block text-xs font-medium text-muted-foreground"
        htmlFor="registerNumber"
      >
        Байгууллагын регистрийн дугаар
      </Label>
      <div className="flex gap-2">
        <Input
          className="h-10 flex-auto"
          id="registerNumber"
          placeholder="Жишээ: 1234567"
          disabled={loading}
          value={current}
          aria-invalid={!!error}
          onChange={(e) => {
            setCurrent(e.target.value)
            setError("")
          }}
          ref={htmlElRef}
        />
        <Button
          className="h-10 flex-none gap-1.5"
          type="submit"
          loading={loading}
          variant="outline"
        >
          {!loading && <SearchIcon className="h-4 w-4" />}
          Шалгах
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
      {data && !error && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
            found
              ? "bg-emerald-50 text-emerald-700"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {found ? (
            <CheckCircle2Icon className="h-4 w-4 flex-none" />
          ) : (
            <XCircleIcon className="h-4 w-4 flex-none" />
          )}
          <span className="truncate">
            {found ? name || "Test company" : "Байгууллага олдсонгүй"}
          </span>
        </div>
      )}
    </form>
  )
}

export default CheckRegister
