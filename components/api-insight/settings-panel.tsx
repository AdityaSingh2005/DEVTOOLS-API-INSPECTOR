"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"

export interface SettingsState {
    hideStaticAssets: boolean
    hideFrameworkInternals: boolean
    hideThirdParty: boolean
    hidePreflight: boolean
}

interface SettingsPanelProps {
    settings: SettingsState
    onSettingsChange: (settings: SettingsState) => void
    onClose: () => void
}

export function SettingsPanel({ settings, onSettingsChange, onClose }: SettingsPanelProps) {
    const toggle = (key: keyof SettingsState) => {
        onSettingsChange({
            ...settings,
            [key]: !settings[key]
        })
    }

    return (
        <div className="flex-1 bg-background p-6 space-y-8 animate-in fade-in-0 slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Settings</h2>
                        <p className="text-sm text-muted-foreground">Configure which logs to capture and display.</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 max-w-2xl">
                {/* Frontend / Static Assets */}
                <div className="flex items-start justify-between space-x-4 rounded-lg border border-border p-4 bg-card/50">
                    <div className="space-y-1">
                        <Label className="text-base">Hide Static Assets</Label>
                        <p className="text-sm text-muted-foreground">
                            Filter out requests for images, fonts, CSS, and JS files (e.g., .png, .css, .js).
                        </p>
                    </div>
                    <Switch
                        checked={settings.hideStaticAssets}
                        onCheckedChange={() => toggle("hideStaticAssets")}
                    />
                </div>

                {/* Framework Internals */}
                <div className="flex items-start justify-between space-x-4 rounded-lg border border-border p-4 bg-card/50">
                    <div className="space-y-1">
                        <Label className="text-base">Hide Framework Internals</Label>
                        <p className="text-sm text-muted-foreground">
                            Filter out Next.js hydration, webpack HMR, and other internal framework requests (e.g., /_next/).
                        </p>
                    </div>
                    <Switch
                        checked={settings.hideFrameworkInternals}
                        onCheckedChange={() => toggle("hideFrameworkInternals")}
                    />
                </div>

                {/* Third Party */}
                <div className="flex items-start justify-between space-x-4 rounded-lg border border-border p-4 bg-card/50">
                    <div className="space-y-1">
                        <Label className="text-base">Hide Third-Party Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                            Filter out requests to common analytics and tracking services (e.g., google-analytics, segment).
                        </p>
                    </div>
                    <Switch
                        checked={settings.hideThirdParty}
                        onCheckedChange={() => toggle("hideThirdParty")}
                    />
                </div>

                {/* Preflight Requests */}
                <div className="flex items-start justify-between space-x-4 rounded-lg border border-border p-4 bg-card/50">
                    <div className="space-y-1">
                        <Label className="text-base">Hide Preflight Requests</Label>
                        <p className="text-sm text-muted-foreground">
                            Hide HTTP OPTIONS requests used for CORS preflight checks.
                        </p>
                    </div>
                    <Switch
                        checked={settings.hidePreflight}
                        onCheckedChange={() => toggle("hidePreflight")}
                    />
                </div>
            </div>
        </div>
    )
}
