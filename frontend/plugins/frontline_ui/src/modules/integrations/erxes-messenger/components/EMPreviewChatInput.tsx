import { IconSend } from "@tabler/icons-react"
import { Button, Input } from "erxes-ui"
import { useAtomValue } from "jotai"
import { erxesMessengerSetupAppearanceAtom } from "../states/erxesMessengerSetupStates"
import { useMemo } from "react"

export const EMPreviewChatInput = () => {
  const appearance = useAtomValue(erxesMessengerSetupAppearanceAtom)

  const backgroundStyles = useMemo(() => {
    return {
      backgroundColor: appearance?.primary?.DEFAULT || '#000'
    }
  }, [appearance])

  return (
    <div className="flex items-center gap-2 p-4">
      <Input placeholder={'Send message'} className="flex-1 shadow-2xs" />
      <Button size={'icon'} className="shrink-0 size-8 bg-primary"><IconSend /></Button>
    </div>
  )
}