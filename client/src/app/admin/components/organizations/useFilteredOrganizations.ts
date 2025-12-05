import { useMemo } from "react";
import { AdminOrganizationData } from "@/api/admin/getAdminOrganizations";

interface FilterOptions {
  searchQuery: string;
  showZeroEvents: boolean;
  showFreeUsers: boolean;
  showOnlyOverLimit: boolean;
}

export function useFilteredOrganizations(
  organizations: AdminOrganizationData[] | undefined,
  { searchQuery, showZeroEvents, showFreeUsers, showOnlyOverLimit }: FilterOptions
) {
  return useMemo(() => {
    if (!organizations) return [];

    let filtered = organizations;

    // Apply search filter
    if (searchQuery.trim()) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(org => {
        return (
          org.name.toLowerCase().includes(lowerSearchQuery) ||
          org.sites.some(site => site.domain.toLowerCase().includes(lowerSearchQuery)) ||
          org.members.some(
            member =>
              member.email.toLowerCase().includes(lowerSearchQuery) ||
              member.name.toLowerCase().includes(lowerSearchQuery)
          )
        );
      });
    }

    // Filter out organizations with 0 events in last 30 days
    if (!showZeroEvents) {
      filtered = filtered.filter(org => org.sites.some(site => site.eventsLast30Days > 0));
    }

    // Filter out free users
    if (!showFreeUsers) {
      filtered = filtered.filter(org => org.subscription.planName !== "free");
    }

    // Show only organizations over their event limit
    if (showOnlyOverLimit) {
      filtered = filtered.filter(org => org.overMonthlyLimit);
    }

    return filtered;
  }, [organizations, searchQuery, showZeroEvents, showFreeUsers, showOnlyOverLimit]);
}
