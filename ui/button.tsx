import * as React from "react"

import { cn } from "@/lib/utils"

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: string
  size?: string
  asChild?: boolean
}) {
  const Comp = asChild ? "span" : "button"

  return (
    <Comp
      data-slot="button"
      className={cn("btn", variant === "danger" && "btn-danger", className)}
      {...props}
    />
  )
}

export { Button }
