import { type EventSeverity } from "./client-sdk-core/index.js";
import type { BrowserSdkConfig } from "./types.js";
export type { AttributeValue, BeforeSend, BrowserSdkConfig, ClientEvent, ClientEventType, ConsoleCaptureConfig, ConsoleCaptureLevel, EventAttributes, EventSeverity, InputCaptureConfig, NetworkCaptureConfig, PointerCaptureConfig, } from "./types.js";
export { SDK_VERSION } from "./version.js";
/**
 * Initialize the SDK. Idempotent: repeat calls are ignored. When `consent`
 * is provided, nothing new is installed (no listeners, no patches, no
 * network) until it resolves true; on false (or a throw) the SDK stays
 * dormant. (Patches pre-installed by `@sazabi/browser/register` exist
 * but remain inert passthroughs until activation.) With
 * `errorsBeforeConsent`, uncaught errors and unhandled rejections are
 * reported, without storage or ids, while consent is pending or refused.
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
 * Emit an application log line (`app.event_type: "log"`) with session context
 * attached. Drops silently before init/consent, like all capture.
 */
export declare const log: (severity: EventSeverity, message: string, metadata?: Record<string, unknown>) => void;
/** Force-flush queued events. */
export declare const flush: () => Promise<void>;
/** Tear down all patches/listeners (restoring originals) and flush. */
export declare const shutdown: () => Promise<void>;
