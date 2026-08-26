import type { BrowserSdkConfig, EventSeverity } from "./types";
export type { AttributeValue, BrowserSdkConfig, ConsoleCaptureConfig, ConsoleCaptureLevel, EventAttributes, EventSeverity, InputCaptureConfig, NetworkCaptureConfig, WebEvent, WebEventType, } from "./types";
export { SDK_VERSION } from "./version";
/**
 * Initialize the SDK. Idempotent: repeat calls are ignored. When `consent`
 * is provided, nothing new is installed — no listeners, no patches, no
 * network — until it resolves true; on false (or a throw) the SDK stays
 * dormant. (Patches pre-installed by `@sazabi/browser/register` exist
 * but remain inert passthroughs until activation.)
 */
export declare const init: (config: BrowserSdkConfig) => void;
/** Set the client-asserted user identity (`session.distinct_id`). */
export declare const identify: (distinctId: string, traits?: Record<string, unknown>) => void;
/**
 * Logout: clear the client-asserted identity and rotate both session and
 * window ids, so later activity on this device never threads into the
 * previous user's timeline.
 */
export declare const reset: () => void;
/** Emit a custom mark into the session event stream. */
export declare const addEvent: (name: string, attributes?: Record<string, unknown>) => void;
/**
 * Emit an application log line (`web.event_type: "log"`) with session context
 * attached. Drops silently before init/consent, like all capture.
 */
export declare const log: (severity: EventSeverity, message: string, metadata?: Record<string, unknown>) => void;
/** Force-flush queued events. */
export declare const flush: () => Promise<void>;
/** Tear down all patches/listeners (restoring originals) and flush. */
export declare const shutdown: () => Promise<void>;
