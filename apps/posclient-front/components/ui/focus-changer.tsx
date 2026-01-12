import useFocus from "@/lib/useFocus"
import { cn } from "@/lib/utils"

function FocusChanger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [ref, setFocus] = useFocus()

  const handleSubmit = (e: any) => {
    e.preventDefault()
    return setFocus()
  }

  return (
    <>
      <form {...props} className={cn(className)} onSubmit={handleSubmit}>
        {children}
        <input
          type="submit"
          style={{ position: "absolute", left: -9999, width: 1, height: 1 }}
          tabIndex={-1}
        />
      </form>
      <div ref={ref} tabIndex={0} />
    </>
  )
}

export { FocusChanger }
