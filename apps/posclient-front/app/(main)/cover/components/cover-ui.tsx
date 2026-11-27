import { cn } from "@/lib/utils"

export const formatAmount = (value?: number) =>
  (Number(value) || 0).toLocaleString()

export const AmountInput = ({
  value,
  onChange,
  disabled,
  className,
  id,
  ariaLabel,
}: {
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
  id?: string
  ariaLabel?: string
}) => (
  <input
    id={id}
    aria-label={ariaLabel}
    type="number"
    inputMode="numeric"
    min={0}
    placeholder="0"
    disabled={disabled}
    value={value ? value : ""}
    onFocus={(e) => e.target.select()}
    onChange={(e) => {
      const next = Number(e.target.value)
      onChange(next > 0 ? next : 0)
    }}
    className={cn(
      "h-7 w-full rounded-sm border-0 bg-muted/60 px-2 text-right text-[13px] font-medium tabular-nums shadow-none outline-none transition-[background-color,box-shadow] [appearance:textfield] placeholder:text-zinc-400 hover:bg-accent focus:bg-background focus:shadow-focus disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-muted/60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      className
    )}
  />
)

export const Difference = ({
  value,
  pending,
}: {
  value: number
  pending?: boolean
}) => {
  if (pending) {
    return <span className="text-muted-foreground">Тоолоогүй</span>
  }

  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        value === 0 && "text-green-600",
        value > 0 && "text-destructive",
        value < 0 && "text-amber-600"
      )}
    >
      {value > 0 ? "−" : value < 0 ? "+" : ""}
      {formatAmount(Math.abs(value))}
    </span>
  )
}

export const CoverBlock = ({
  title,
  description,
  action,
  children,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) => (
  <section className="flex min-w-0 flex-col gap-2">
    <div className="flex min-h-7 items-center gap-3">
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <h2 className="flex-none text-[13px] font-medium">{title}</h2>
        {description && (
          <p className="truncate text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-none">{action}</div>}
    </div>
    {children}
  </section>
)

export const coverTableFrameClass =
  "overflow-hidden rounded-lg border-4 border-sidebar bg-sidebar"

export const cellInputClass =
  "h-8 rounded-none bg-transparent px-3 hover:bg-accent focus:bg-background focus:shadow-none focus:ring-2 focus:ring-inset focus:ring-primary/40 disabled:hover:bg-transparent"
