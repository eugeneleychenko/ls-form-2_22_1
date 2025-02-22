import type React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormLabelProps {
  children: React.ReactNode
  required?: boolean
  className?: string
}

export function FormLabel({ children, required, className }: FormLabelProps) {
  return (
    <Label className={cn("flex items-center gap-1", className)}>
      {children}
      {required && <span className="text-destructive">*</span>}
    </Label>
  )
}

