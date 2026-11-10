import type { BeforeSend, ConsoleCaptureConfig, NetworkCaptureConfig as CoreNetworkCaptureConfig, PointerCaptureConfig } from "./client-sdk-core/index.js";
export type { AttributeValue, BeforeSend, ClientEvent, ClientEventType, ConsoleCaptureConfig, ConsoleCaptureLevel, EventAttributes, EventSeverity, PointerCaptureConfig, } from "./client-sdk-core/index.js";
export interface InputCaptureConfig {
    /**
     * Emit one `input` event per field-interaction episode (never keystrokes,
     * never values; see the privacy invariants in input-capture.ts).
     * Default true.
     */
    capture?: boolean;
}
export interface NetworkCaptureConfig extends CoreNetworkCaptureConfig {
    /**
     * Patch-independent fallback capture via PerformanceObserver resource
     * timing: requests that bypass the fetch/XHR patches (clients that
     * captured the natives before the SDK) still produce degraded network
     * events plus a once-per-origin instrumentation-gap diagnostic.
     * Default true.
     */
    resourceFallback?: boolean;
    /**
     * Requests eligible for `traceparent` injection. A string is a host
     * (`api.example.com`), a domain with every subdomain (`.example.com`), or
     * an origin with an optional path prefix (`https://api.example.com`); a
     * RegExp is tested against the full URL. Default: same-origin requests
     * only, because cross-origin injection requires the target to allowlist
     * the header in CORS, so it is opt-in.
     */
    allowlist?: (string | RegExp)[];
}
export interface BrowserSdkConfig {
    /**
     * The project's intake URL, exactly as the log source issues it, e.g.
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
    pointer?: PointerCaptureConfig;
    /**
     * Consent gate: capture holds until this resolves true. When it resolves
     * false the SDK stays dormant. Richer semantics (revocation, per-plane
     * grants) are deliberately deferred; only the API shape is stable.
     */
    consent?: () => boolean | Promise<boolean>;
    /**
     * With a `consent` gate, report uncaught errors and unhandled rejections
     * while consent is pending or refused. These reports carry no session,
     * window or user id, read and write no cookie or storage, and record the
     * page as origin and path only (no query or fragment). Nothing else is
     * captured until consent resolves true, when full capture replaces this
     * mode. Default false. Check with your privacy counsel before enabling it
     * for visitors who must opt in.
     */
    errorsBeforeConsent?: boolean;
    /** Batch flush cadence in ms. Default 5000. */
    flushIntervalMs?: number;
    /**
     * Soft cap per OTLP request body in bytes. Default 57344 (56 KiB), leaving
     * headroom under the ~64 KiB fetch-keepalive budget that unload flushes
     * must fit inside.
     */
    maxBatchBytes?: number;
    /**
     * Max buffered events (and at most 1 MiB) while the intake is unreachable;
     * the oldest are dropped first and counted in `app.sdk.dropped_events`.
     * Default 500.
     */
    maxQueuedEvents?: number;
    /**
     * Edit or drop events before they are queued: return the event to send it,
     * `null` to drop it. Runs for every event type, `sdk_health` included. A
     * hook that throws drops the event and warns once; an event captured
     * synchronously while the hook runs (a `log()` inside it) is dropped. A
     * request the hook makes produces its own network event later, which the
     * hook sees like any other and must exclude itself.
     */
    beforeSend?: BeforeSend;
}
