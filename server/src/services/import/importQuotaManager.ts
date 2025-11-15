import { ImportQuotaTracker } from "./importQuotaChecker.js";
import { IS_CLOUD } from "../../lib/const.js";

interface CachedTracker {
  tracker: ImportQuotaTracker;
  lastAccessed: number;
}

interface ActiveImport {
  startedAt: number;
}

class ImportQuotaManager {
  private trackers: Map<string, CachedTracker> = new Map();
  private activeImports: Map<string, Set<ActiveImport>> = new Map();

  private readonly CONCURRENT_IMPORT_LIMIT = 1;
  private readonly TRACKER_TTL_MS = 30 * 60 * 1000; // 30 minutes
  private readonly IMPORT_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

  async getTracker(organizationId: string): Promise<ImportQuotaTracker> {
    const now = Date.now();
    const cached = this.trackers.get(organizationId);

    if (cached && now - cached.lastAccessed < this.TRACKER_TTL_MS) {
      cached.lastAccessed = now;
      return cached.tracker;
    }
    // Create new tracker
    const tracker = await ImportQuotaTracker.create(organizationId);
    this.trackers.set(organizationId, {
      tracker,
      lastAccessed: now,
    });

    return tracker;
  }

  startImport(organizationId: string): boolean {
    if (!IS_CLOUD) {
      return true;
    }

    this.cleanupAbandonedImports(organizationId);

    let activeSet = this.activeImports.get(organizationId);
    if (!activeSet) {
      activeSet = new Set();
      this.activeImports.set(organizationId, activeSet);
    }

    if (activeSet.size >= this.CONCURRENT_IMPORT_LIMIT) {
      return false;
    }

    activeSet.add({
      startedAt: Date.now(),
    });

    return true;
  }

  completeImport(organizationId: string): void {
    const activeSet = this.activeImports.get(organizationId);
    if (!activeSet) {
      return;
    }

    // Remove the first (and only, since limit=1) import
    const firstImport = activeSet.values().next().value;
    if (firstImport) {
      activeSet.delete(firstImport);
    }

    if (activeSet.size === 0) {
      this.activeImports.delete(organizationId);
    }
  }

  private cleanupAbandonedImports(organizationId: string): void {
    const activeSet = this.activeImports.get(organizationId);
    if (!activeSet) {
      return;
    }

    const now = Date.now();
    const toRemove: ActiveImport[] = [];

    for (const activeImport of activeSet) {
      if (now - activeImport.startedAt > this.IMPORT_TIMEOUT_MS) {
        toRemove.push(activeImport);
      }
    }

    for (const importToRemove of toRemove) {
      activeSet.delete(importToRemove);
    }

    if (activeSet.size === 0) {
      this.activeImports.delete(organizationId);
    }
  }

  cleanup(): void {
    const now = Date.now();

    // Clean up stale trackers
    for (const [orgId, cached] of this.trackers.entries()) {
      if (now - cached.lastAccessed > this.TRACKER_TTL_MS) {
        this.trackers.delete(orgId);
      }
    }

    // Clean up abandoned imports across all organizations
    for (const orgId of this.activeImports.keys()) {
      this.cleanupAbandonedImports(orgId);
    }
  }
}

export const importQuotaManager = new ImportQuotaManager();

if (IS_CLOUD) {
  setInterval(
    () => {
      importQuotaManager.cleanup();
    },
    15 * 60 * 1000
  );
}
