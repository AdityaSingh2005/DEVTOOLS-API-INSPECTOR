import { Loader2 } from "lucide-react"

interface StatusBadgeProps {
  status: number
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: number) => {
    if (status === 0 || status === -1) {
      return "bg-background text-muted-foreground border-border"
    }
    if (status >= 200 && status < 300) {
      return "bg-status-success/20 text-status-success border-status-success/30"
    } else if (status >= 300 && status < 400) {
      return "bg-status-redirect/20 text-status-redirect border-status-redirect/30"
    } else if (status >= 400 && status < 500) {
      return "bg-status-client-error/20 text-status-client-error border-status-client-error/30"
    } else if (status >= 500) {
      return "bg-status-error/20 text-status-error border-status-error/30"
    }
    return "bg-muted text-muted-foreground border-border"
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium gap-1 ${getStatusStyle(
        status,
      )}`}
    >
      {status === 0 ? <Loader2 className="h-3 w-3 animate-spin" /> : status}
      {status === 0 && "Pending"}
    </span>
  )
}
