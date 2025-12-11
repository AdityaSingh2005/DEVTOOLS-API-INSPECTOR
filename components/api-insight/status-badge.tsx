interface StatusBadgeProps {
  status: number
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: number) => {
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
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusStyle(
        status,
      )}`}
    >
      {status}
    </span>
  )
}
