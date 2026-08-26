import type { WebEvent } from "./types";
export interface ResourceObserverOptions {
    emit(event: WebEvent): void;
    /** SDK-internal endpoints: never reported. */
    isInternalUrl(url: string): boolean;
    /** Would the active config have injected trace context into this URL? */
    isInjectionTarget(url: string): boolean;
}
export interface ResourceObserverHandle {
    teardown(): void;
}
/**
 * Patch-independent network visibility: PerformanceObserver resource timing
 * sees every fetch/XHR the page performs — including ones issued by clients
 * that captured the native functions before the SDK patched (`buffered: true`
 * also replays requests from before init). Wrapper-captured requests are
 * deduped out via the wrapper-seen ledger; the leftovers get a degraded
 * network event (no method, no trace id — observation cannot inject), plus a
 * once-per-origin instrumentation-gap diagnostic when the URL was an
 * injection target, so bypass is a visible signal instead of silent loss.
 */
export declare const installResourceObserver: (options: ResourceObserverOptions) => ResourceObserverHandle;
