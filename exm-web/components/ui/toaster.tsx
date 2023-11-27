"use client"

import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        const getIcon = () => {
          switch (props.variant) {
            case "success":
              return <CheckCircle className="w-5 h-5 shrink-0" />
            case "warning":
              return <AlertTriangle className="w-5 h-5 shrink-0" />
            case "destructive":
              return <XCircle className="w-5 h-5 shrink-0" />
            default:
              return <Info className="w-5 h-5 shrink-0" />
          }
        }

        return (
          <Toast key={id} {...props}>
            {getIcon()}
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>

            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
