/** Group password storage and verification - demo implementation */
export class GroupPasswordStore {
  private passwords = new Map<string, string>();

  /** Initialize with seed groups that have passwords */
  initialize(groups: { id: string; status: string }[]): void {
    for (const g of groups) {
      if (g.status === "locked") {
        this.passwords.set(g.id, "demo123");
      }
    }
  }

  /** Store password for newly created group */
  set(groupId: string, password: string): void {
    this.passwords.set(groupId, password);
  }

  /** Verify password for group */
  verify(groupId: string, password: string): boolean {
    const stored = this.passwords.get(groupId);
    return stored !== undefined && stored === password;
  }

  /** Check if group has a password set */
  hasPassword(groupId: string): boolean {
    return this.passwords.has(groupId);
  }
}

/** Singleton instance for demo */
export const groupPasswordStore = new GroupPasswordStore();