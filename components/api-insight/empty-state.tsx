"use client"

import { Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onStartCapturing?: () => void
  isCapturing?: boolean
}

export function EmptyState({ onStartCapturing, isCapturing }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
      <div className="rounded-full bg-secondary p-4 mb-4">
        <Activity className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-2">
        {isCapturing ? "Waiting for network activity..." : "No network activity captured"}
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        No network activity captured in this time window. Start capturing to see API requests.
      </p>
      <Button onClick={onStartCapturing} className="gap-2">
        <Activity className="h-4 w-4" />
        Start Capturing
      </Button>
    </div>
  )
}
