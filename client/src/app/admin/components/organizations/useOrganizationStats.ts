import { useMemo } from "react";
import { AdminOrganizationData } from "@/api/admin/getAdminOrganizations";

export function useOrganizationStats(organizations: AdminOrganizationData[] | undefined) {
  return useMemo(() => {
    if (!organizations) {
      return {
        totalOrganizations: 0,
        activeOrganizations: 0,
        paidOrganizations: 0,
        totalEventsLast30Days: 0,
      };
    }

    const totalOrganizations = organizations.length;

    // Count organizations with at least 1 event in past 30 days
    const activeOrganizations = organizations.filter(org =>
      org.sites.some(site => site.eventsLast30Days > 0)
    ).length;

    // Count paid organizations (with a subscription)
    const paidOrganizations = organizations.filter(
      org => org.subscription.planName !== "free"
    ).length;

    // Sum all events from past 30 days
    const totalEventsLast30Days = organizations.reduce(
      (total, org) =>
        total + org.sites.reduce((sum, site) => sum + Number(site.eventsLast30Days), 0),
      0
    );

    return {
      totalOrganizations,
      activeOrganizations,
      paidOrganizations,
      totalEventsLast30Days,
    };
  }, [organizations]);
}
