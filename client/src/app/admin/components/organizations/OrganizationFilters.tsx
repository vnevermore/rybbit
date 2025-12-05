"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface OrganizationFiltersProps {
  showZeroEvents: boolean;
  setShowZeroEvents: (value: boolean) => void;
  showFreeUsers: boolean;
  setShowFreeUsers: (value: boolean) => void;
  showOnlyOverLimit: boolean;
  setShowOnlyOverLimit: (value: boolean) => void;
}

export function OrganizationFilters({
  showZeroEvents,
  setShowZeroEvents,
  showFreeUsers,
  setShowFreeUsers,
  showOnlyOverLimit,
  setShowOnlyOverLimit,
}: OrganizationFiltersProps) {
  return (
    <div className="flex items-center gap-6 mb-4 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg">
      <div className="flex items-center gap-2">
        <Switch id="show-zero-events" checked={showZeroEvents} onCheckedChange={setShowZeroEvents} />
        <Label htmlFor="show-zero-events" className="text-sm cursor-pointer">
          Show orgs with 0 events (30d)
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="show-free-users" checked={showFreeUsers} onCheckedChange={setShowFreeUsers} />
        <Label htmlFor="show-free-users" className="text-sm cursor-pointer">
          Show free users
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="show-only-over-limit" checked={showOnlyOverLimit} onCheckedChange={setShowOnlyOverLimit} />
        <Label htmlFor="show-only-over-limit" className="text-sm cursor-pointer">
          Only over limit
        </Label>
      </div>
    </div>
  );
}
