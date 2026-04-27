import { FormEvent, useState } from "react"
import { requirePasswordAtom, updateCartAtom } from "@/store/cart.store"
import { orderPasswordAtom } from "@/store/config.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const RequirePassword = () => {
  const orderPassword = useAtomValue(orderPasswordAtom)
  const [requirePassword, setRequirePassword] = useAtom(requirePasswordAtom)
  const changeCart = useSetAtom(updateCartAtom)
  const [value, setValue] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value === orderPassword && requirePassword?._id) {
      changeCart({ ...(requirePassword || {}), allowed: true })
      setRequirePassword(null)
      return setValue("")
    }
    setError(true)
  }

  return (
    <Dialog
      open={!!requirePassword}
      onOpenChange={(open) => !open && setRequirePassword(null)}
    >
      <DialogContent>
        <form className="space-y-1" onSubmit={handleSubmit}>
          <Label>Нууц үг</Label>
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type="password"
              autoComplete="off"
            />
            <Button type="submit">Батлах</Button>
          </div>
          <div className={error ? "text-destructive" : "text-muted-foreground"}>
            Баталгаажуулах нууц {error && "зөв"} үгээ оруулана уу
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RequirePassword
