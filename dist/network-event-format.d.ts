import type { EventSeverity } from "./types";
/** Compact display path: pathname when same-origin, host+path cross-origin. */
export declare const urlPath: (resolved: string) => string;
/** Status 0 means transport failure. */
export declare const severityForStatus: (status: number) => EventSeverity;
