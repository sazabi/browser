# @sazabi/browser

Capture what happens in your users' browsers with `@sazabi/browser`, the official Sazabi browser SDK. It emits a session-scoped stream of navigation, interactions, console output, JavaScript errors, and network calls as OTLP log records, and injects W3C trace context into your API requests so a frontend symptom and its backend cause share a trace id.

`@sazabi/browser` is a zero-dependency browser library you install in your own web app. It lets you:

- Follow a single visitor's session across tabs, from first page load to error
- Catch uncaught exceptions and unhandled promise rejections with stack traces
- See rage clicks and dead clicks — the interactions that signal frustration
- Join frontend network calls to backend logs on a shared `trace_id`
- Use AI to investigate a browser session end to end

~8 KB gzipped, and designed to never break your app: every hook is wrapped, every patch is reversible, and input values are never captured.

## Install

```sh
npm install @sazabi/browser
# or: bun add / pnpm add / yarn add
```

## Get your intake URL

Sign in to Sazabi, go to **Settings > Log streams**, choose **Sazabi Browser SDK**, and click **Add**. Sazabi shows your complete intake URL at the top of the setup screen.

That URL is all the SDK needs — pass it as `intakeUrl`, with or without the `/v1/logs` path.

The URL embeds a write-only public key, which is why it is safe to ship in your browser bundle: it can write telemetry into your project and never read from it.

## Quick start

```ts
// Import first, because a module that runs earlier can capture the native
// fetch/XHR/history references before the SDK wraps them.
import "@sazabi/browser/register";

import { init } from "@sazabi/browser";

init({
  intakeUrl: "https://<your-intake-host>.intake.sazabi.com",
  serviceName: "my-web-app",
  serviceVersion: process.env.GIT_SHA,
  environment: "production",
});
```

`init()` is idempotent, never throws into your app, and no-ops during server-side rendering, so it is safe in a shared entry module.

The register import is optional but recommended. `init()` alone also instruments, but only at call time — and every static import in your entry file evaluates before its first statement, so an HTTP client constructed at module scope wins that race. Requests that slip past instrumentation are still observed through a resource-timing fallback, and the SDK emits a once-per-origin `instrumentation_gap` diagnostic naming the escaped origin, so the gap is visible rather than silent.

## What gets captured

Every event carries a cross-tab `session.id`, a per-tab `session.window_id`, `session.distinct_id`, and the page URL (`app.screen.url`, with sensitive query parameters redacted the same way as captured request URLs, see [Privacy and safety](#privacy-and-safety)), so one user's activity reads as a single ordered timeline. The `app.event_type` attribute names the kind:

| `app.event_type` | Contents |
|------------------|----------|
| `navigation` | Page loads and SPA route changes — History API, hash, back/forward, and the Navigation API |
| `pointer` | One episode per mouse, touch, or pen contact from down to up: coordinates, distance, duration, pressure, concurrent contacts, a gesture id shared by overlapping contacts, and a once-per-second path sample; long contacts emit partial rows every ten seconds. A contact the browser takes over, such as a touch scroll, ends there with `app.pointer.ended_by: cancel` |
| `click` | Taps derived from pointer episodes, plus keyboard and script clicks, with a privacy-safe selector (`app.widget.id`) and the element's label (`app.widget.name`, "Save changes") |
| `rage_click` / `dead_click` | Frustration signals: rapid repeat clicks, and clicks with no visible response |
| `input` | One event per field engagement — which field, for how long, how many edits, whether pasted. Never keystrokes, values, or value lengths |
| `error` | Uncaught exceptions and unhandled rejections with `exception.type`, `exception.message`, and `exception.stacktrace` |
| `network` | fetch and XHR calls with method, status, and duration — plus the trace context injected into them |
| `log` | Mirrored `console.error` / `console.warn` output, plus anything you send with `log()` |
| `custom` | Marks you add with `addEvent()` |
| `lifecycle` | The tab going to the background and coming back |
| `sdk_health` | The SDK's own delivery trouble, once per condition per page (see [SDK health](#sdk-health)) |

## Correlate with your backend

The SDK injects a W3C `traceparent` header into same-origin requests by default. To reach an API on another origin, allowlist it — and make sure that API's CORS configuration includes `traceparent` in `Access-Control-Allow-Headers`, or the browser preflight fails and those requests break:

```ts
init({
  // …
  network: {
    allowlist: ["https://api.example.com"],
  },
});
```

An allowlist string is an origin with an optional path prefix (`https://api.example.com`, `https://example.com/api`), a host (`api.example.com`), or a domain with every subdomain (`.example.com`); it never matches a URL that merely contains it. A RegExp is tested against the full URL.

Backend log lines that run inside the extracted trace context then share a `trace_id` with the originating browser request. If your backend runs OpenTelemetry, that extraction already happens by default. Set `network: { sampledFlag: true }` if you also want your backend tracer to *record* those traces — the logs-side join works either way.

Captured URLs keep their query string, but the values of sensitive parameters are replaced with `[redacted]`, in `url.full` for requests and navigations as well as in the page URL stamped on every event (`app.screen.url`) and the referrer (`app.navigation.from`): `token`, `access_token`, `refresh_token`, `id_token`, `api_key`, `apikey`, `key`, `secret`, `password`, `signature`, `sig`, `x-amz-signature`, `x-amz-credential`, `x-goog-signature`, `sentry_key`, `authorization`, `auth`, `session`, `sid`, and `code`, matched by name and case-insensitively. Add your own with `network.redactQueryParams` (strings match a name exactly, RegExps are tested against the name, from the start each time, so a `g` flag is safe). Credentials in the URL (`user:pass@`) are never recorded.

The SDK also records platform request ids echoed on responses (`x-request-id`, `cf-ray`, `x-vercel-id`, and similar) as `app.network.request_id`, giving you an exact join key against CDN and platform logs with no backend changes. Reading these cross-origin requires the header in `Access-Control-Expose-Headers`.

## Identify users

```ts
import { identify, reset } from "@sazabi/browser";

identify("user_123", { plan: "pro" }); // on sign-in — use your internal id, not an email
reset(); // on sign-out
```

`identify()` stamps `session.distinct_id` on subsequent events and records the traits on the identify event. `reset()` clears the identity and rotates the session and window ids, so activity on a shared device never threads into the previous user's timeline; switching identities without a `reset()` rotates automatically.

Identity is client-asserted — treat it as a claim, not as authentication.

## Logs, custom events, and console output

```ts
import { addEvent, log } from "@sazabi/browser";

addEvent("checkout_started", { cartValue: 42 });
log("WARN", "cache lookup failed", { requestId: "req_9" });
```

`console.error` and `console.warn` are mirrored into the event stream by default, and the original console behavior is untouched. Configure with `console: { levels: [...] }` or turn it off with `console: { capture: false }`.

## Consent

If your users must opt in before capture, pass a consent gate — nothing is installed and nothing is sent until it resolves true:

```ts
init({
  // …
  consent: () => cookieBanner.accepted(),
});
```

`identify()` calls made while consent is pending are buffered and applied when capture starts.

## Configuration

| Option | Default | Purpose |
|--------|---------|---------|
| `network.capture` | `true` | Emit network events for fetch/XHR |
| `network.propagateTraceContext` | `true` | Inject `traceparent` into eligible requests |
| `network.allowlist` | same-origin only | Origins, hosts, or `.domain` suffixes eligible for header injection |
| `network.redactQueryParams` | see below | Extra query parameter names whose values are redacted in `url.full`, the page URL (`app.screen.url`) and the referrer |
| `network.sampledFlag` | `false` | Mark minted traces sampled (`-01`) for backend tracers |
| `network.resourceFallback` | `true` | Observe requests that bypass instrumentation |
| `network.requestIdHeaders` | common platform headers | Response headers probed for a request id |
| `console.capture` / `console.levels` | `true`, `["error", "warn"]` | Console mirroring |
| `input.capture` | `true` | Field-interaction episodes |
| `consent` | off | Hold all capture until it resolves true |
| `flushIntervalMs` | `5000` | Batch flush cadence |
| `maxQueuedEvents` | `500` | Events held while the intake is unreachable (plus a 1 MiB cap); the oldest are dropped first, and a single event larger than 1 MiB is dropped |
| `beforeSend` | off | Edit or drop an event before it is queued: `(event) => event \| null`. The browser reports a dropped connection, a CORS or CSP refusal and an extension block identically (status 0, `Failed to fetch`), so the SDK records them all at `ERROR`; use this hook when your app knows better, e.g. record a network failure that hung for seconds at `DEBUG`. A hook that throws drops the event and warns once; an event captured synchronously while the hook runs (a `log()` inside it) is dropped. A `fetch` the hook makes produces its own network event once it completes, which the hook sees like any other, so a hook that forwards events must exclude its own requests |

### Delivery

| Intake answer | What the SDK does |
|---------------|-------------------|
| 2xx | Done |
| 408, 429, 5xx, network error, no answer in 30 s | Keeps the batch and retries with exponential backoff (1 s doubling to a 60 s cap, with jitter), or after `Retry-After` when that is longer (up to 5 minutes). Nothing else is sent during the backoff except the unload flush |
| 413 | Splits the batch in half and sends each half; a single event that is still too large is dropped. If the first half gets a retryable answer, the second half waits out the same backoff |
| Any other 4xx (400, 401, 403, 404, ...) | Drops the batch; never retried |

A dropped batch and a full queue each print one `[@sazabi/browser]` console warning per page, and the first event delivered after a drop carries `app.sdk.dropped_events` with the number lost.

Every upload names the SDK in an `x-sazabi-sdk` header (`@sazabi/browser/<version>`), the keepalive flush when the tab closes included (it is an ordinary `fetch`, so it carries the header; the SDK never uses `sendBeacon`), so Sazabi can tell a misconfigured page from random traffic even when it rejects the request. The intake admits the header in its CORS preflight.

### SDK health

The SDK reports its own delivery trouble as `app.event_type: sdk_health` rows, INFO severity, with `app.sdk.diagnostic` naming the condition: `intake_rejected` (a batch refused for good with a 4xx other than 408 and 429; `app.sdk.http_status` carries the status) and `intake_unreachable` (uploads failed on the network or timed out and the intake later answered; `app.sdk.attempts` counts the failed tries, with uploads that failed together counted once). Each condition is reported at most once per page, so a row the intake refuses is never reported again and a flapping network produces one row, not one per outage. The once-per-origin `instrumentation_gap` diagnostic (see [Install](#install)) is a `log` row and is unchanged. Nothing here changes how your events are handled, and the rows never throw into your page.

## Privacy and safety

- **Input values, keystrokes, request bodies, and response bodies are never captured** — not even value lengths.
- Sensitive query parameters (tokens, OAuth codes, API keys, signatures, plus `network.redactQueryParams`) are redacted in every recorded URL: captured requests, navigations, the referrer, and the page URL stamped on each event.
- Element names come from developer-authored sources only (`aria-label`, `<label>`, `placeholder`, button captions), and only for interactive elements. Clicks on plain containers, where user content lives, record selectors only.
- Add `data-sazabi-mask` to any element to suppress text capture for its whole subtree, or `data-sazabi-name` to set an element's reported name explicitly.
- Every patch is transparent, idempotent, and reversible. SDK failures are invisible to your app, and `shutdown()` restores the original functions.
- Events are delivered as OTLP/HTTP log records with batching, and flushed with `keepalive` when the tab closes.

## Verifying it works

Load your app and click through a few pages. The SDK flushes every 5 seconds and again when the tab is hidden or closed, so the first events land within about 10 seconds. In your browser's network tab, filter for `intake` — POSTs to `/v1/logs` should return 200.

Full setup guide and troubleshooting: [docs.sazabi.com/catalogs/log-sources/send-to-an-endpoint/sazabi-browser-sdk](https://docs.sazabi.com/catalogs/log-sources/send-to-an-endpoint/sazabi-browser-sdk).
