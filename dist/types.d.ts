export type AttributeValue = string | number | boolean;
export type EventAttributes = Record<string, AttributeValue | undefined>;
export type EventSeverity = "DEBUG" | "INFO" | "WARN" | "ERROR";
export type WebEventType = "navigation" | "click" | "rage_click" | "dead_click" | "input" | "network" | "error" | "custom" | "log";
/** An SDK-internal semantic event, before OTLP encoding. */
export interface WebEvent {
    type: WebEventType;
    body: string;
    severity: EventSeverity;
    timeUnixMs: number;
    /** Set on network events when trace context was injected into the request. */
    traceId?: string;
    spanId?: string;
    attributes: EventAttributes;
}
export interface InputCaptureConfig {
    /**
     * Emit one `input` event per field-interaction episode (never keystrokes,
     * never values — see the privacy invariants in input-capture.ts).
     * Default true.
     */
    capture?: boolean;
}
export type ConsoleCaptureLevel = "error" | "warn" | "info" | "debug";
export interface ConsoleCaptureConfig {
    /** Mirror console output into the event stream. Default true. */
    capture?: boolean;
    /** Console levels to mirror. Default ["error", "warn"]. */
    levels?: ConsoleCaptureLevel[];
}
export interface NetworkCaptureConfig {
    /** Emit network events for fetch/XHR. Default true. */
    capture?: boolean;
    /** Inject W3C `traceparent` into allowlisted requests. Default true. */
    propagateTraceContext?: boolean;
    /**
     * Patch-independent fallback capture via PerformanceObserver resource
     * timing: requests that bypass the fetch/XHR patches (clients that
     * captured the natives before the SDK) still produce degraded network
     * events plus a once-per-origin instrumentation-gap diagnostic.
     * Default true.
     */
    resourceFallback?: boolean;
    /**
     * Response headers probed (in order) for a platform request id to attach
     * as `web.network.request_id` — an exact join key against platform logs
     * (CDN/edge/PaaS) without any backend change. Cross-origin reads require
     * the header in `Access-Control-Expose-Headers`.
     */
    requestIdHeaders?: string[];
    /**
     * URL patterns eligible for `traceparent` injection. Strings match by
     * substring, RegExps by test. Default: same-origin requests only —
     * cross-origin injection requires the target to allowlist the header in
     * CORS, so it is opt-in.
     */
    allowlist?: (string | RegExp)[];
    /**
     * Set the sampled flag (`-01`) on SDK-minted trace roots. Default false
     * (`-00`): the sampled bit steers customers' ParentBased backend samplers,
     * and forcing 100% backend trace sampling is not this SDK's call to make.
     * The logs-side trace_id join works regardless of this flag.
     */
    sampledFlag?: boolean;
}
export interface BrowserSdkConfig {
    /**
     * The project's intake URL, exactly as the log source issues it — e.g.
     * `https://<key>.us-west-2.intake.sazabi.com`. The credential is embedded in
     * the hostname, so this is normally the only endpoint config needed; `/v1/logs`
     * may be included or omitted.
     */
    intakeUrl?: string;
    /**
     * Public ingest key (`sazabi_public_...`). Optional: derived from `intakeUrl`
     * when that URL is a keyed intake host. Set it only for a proxy or custom
     * endpoint whose hostname carries no key.
     */
    publicKey?: string;
    /** @deprecated Use `intakeUrl`. Accepted as an alias. */
    intakeHost?: string;
    /** Logical service name for the frontend app. */
    serviceName: string;
    /** Service version (e.g. git SHA). */
    serviceVersion?: string;
    /** Deployment environment (e.g. "production"). */
    environment?: string;
    network?: NetworkCaptureConfig;
    console?: ConsoleCaptureConfig;
    input?: InputCaptureConfig;
    /**
     * Consent gate: capture holds until this resolves true. When it resolves
     * false the SDK stays dormant. Richer semantics (revocation, per-plane
     * grants) are deliberately deferred; only the API shape is stable.
     */
    consent?: () => boolean | Promise<boolean>;
    /** Batch flush cadence in ms. Default 5000. */
    flushIntervalMs?: number;
    /**
     * Soft cap per OTLP request body in bytes. Default 57344 (56 KiB), leaving
     * headroom under the ~64 KiB fetch-keepalive budget that unload flushes
     * must fit inside.
     */
    maxBatchBytes?: number;
    /** Max buffered events before the oldest are dropped. Default 500. */
    maxQueuedEvents?: number;
}
