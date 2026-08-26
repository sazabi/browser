export interface SessionManager {
    getSessionId(): string;
    getWindowId(): string;
    getDistinctId(): string | undefined;
    /**
     * Set the client-asserted identity. Switching from one identity directly
     * to a different one rotates the session and window ids so two users on a
     * shared device never thread into one timeline.
     */
    setDistinctId(distinctId: string): void;
    /** Logout: clear identity and rotate both session and window ids. */
    reset(): void;
    /** Record user activity; may rotate the session on idle/max-age expiry. */
    touch(): void;
}
/**
 * Cross-tab session identity. `session.id` is the visit (localStorage, shared
 * across tabs, last-writer-wins on rotation races — a split session is
 * cosmetic, not data loss). `session.window_id` is this tab (sessionStorage).
 * `session.distinct_id` is read through storage so identify/reset in one tab
 * is visible to sibling tabs on their next event.
 */
export declare const createSessionManager: () => SessionManager;
