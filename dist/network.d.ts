import type { TraceContextManager } from "./trace-context";
import type { WebEvent } from "./types";
export interface NetworkCaptureOptions {
    emit(event: WebEvent): void;
    traceContext: TraceContextManager;
    /** Emit network events. */
    capture: boolean;
    /** Inject `traceparent` into allowlisted requests. */
    propagateTraceContext: boolean;
    /** Injection allowlist; empty means same-origin only. */
    allowlist: (string | RegExp)[];
    /** Response headers probed for a platform request id, in priority order. */
    requestIdHeaders: string[];
    /** SDK-internal endpoints: never captured, never injected. */
    isInternalUrl(url: string): boolean;
}
export interface NetworkCaptureHandle {
    teardown(): void;
}
/** Injection eligibility for the active config; used by the resource observer
 * to decide whether a bypassed request is a diagnosable instrumentation gap. */
export declare const isActiveInjectionTarget: (resolved: string) => boolean;
/** Consume a wrapper-seen record matching this resource entry, if any. */
export declare const consumeWrapperSeen: (url: string, startTime: number) => boolean;
/**
 * Install dormant fetch/XHR patches around whatever implementations are
 * currently live. Idempotent, and re-wraps when a later actor (test stubs,
 * mocking layers) replaced the primitives after an earlier install — the
 * displaced wrapper is an inert passthrough, so single-processing holds.
 */
export declare const ensureNetworkPatches: () => void;
/**
 * Restore the natives if the current implementations are still ours; if
 * someone patched on top of us, restoring would clobber them — the inactive
 * wrappers pass through.
 */
export declare const uninstallNetworkPatches: () => void;
export declare const installNetworkCapture: (options: NetworkCaptureOptions) => NetworkCaptureHandle;
