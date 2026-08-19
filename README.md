# @sazabi/browser-sdk

Capture what happens in your users' browsers with `@sazabi/browser-sdk`, the official Sazabi browser SDK. It emits a session-scoped stream of navigation, interactions, console output, JavaScript errors, and network calls as OTLP log records, and injects W3C trace context into your API requests so a frontend symptom and its backend cause share a trace id.

`@sazabi/browser-sdk` is a zero-dependency browser library you install in your own web app. It lets you:

- Follow a single visitor's session across tabs, from first page load to error
- Catch uncaught exceptions and unhandled promise rejections with stack traces
- See rage clicks and dead clicks — the interactions that signal frustration
- Join frontend network calls to backend logs on a shared `trace_id`
- Use AI to investigate a browser session end to end

~8 KB gzipped, and designed to never break your app: every hook is wrapped, every patch is reversible, and input values are never captured.

## Install

```sh
npm install @sazabi/browser-sdk
# or: bun add / pnpm add / yarn add
```

## Get your intake URL

Sign in to Sazabi, go to **Settings > Log streams**, choose **Web**, and click **Add**. Sazabi mints a public key and shows your complete intake URL at the top of the setup screen.

The SDK needs both values: the intake URL as `intakeHost` (the SDK appends the `/v1/logs` signal path itself) and the full `sazabi_public_...` value as `publicKey`.

Unlike most credentials, this one is **meant** to ship in your browser bundle — a public key can only write telemetry into your project, never read from it.

## Quick start

```ts
// Import first, because a module that runs earlier can capture the native
// fetch/XHR/history references before the SDK wraps them.
import "@sazabi/browser-sdk/register";

import { init } from "@sazabi/browser-sdk";

init({
  intakeHost: "https://<public-key-hex>.<region>.intake.sazabi.com",
  publicKey: "sazabi_public_<public-key-hex>",
  serviceName: "my-web-app",
  serviceVersion: process.env.GIT_SHA,
  environment: "production",
});
```

`init()` is idempotent, never throws into your app, and no-ops during server-side rendering, so it is safe in a shared entry module.

The register import is optional but recommended. `init()` alone also instruments, but only at call time — and every static import in your entry file evaluates before its first statement, so an HTTP client constructed at module scope wins that race. Requests that slip past instrumentation are still observed through a resource-timing fallback, and the SDK emits a once-per-origin `instrumentation_gap` diagnostic naming the escaped origin, so the gap is visible rather than silent.

## What gets captured

Every event carries a cross-tab `session.id`, a per-tab `session.window_id`, `session.distinct_id`, and the page URL, so one user's activity reads as a single ordered timeline. The `web.event_type` attribute names the kind:

| `web.event_type` | Contents |
|------------------|----------|
| `navigation` | Page loads and SPA route changes — History API, hash, back/forward, and the Navigation API |
| `click` | Capture-phase clicks with a privacy-safe selector and the element's label ("Save changes") |
| `rage_click` / `dead_click` | Frustration signals: rapid repeat clicks, and clicks with no visible response |
| `input` | One event per field engagement — which field, for how long, how many edits, whether pasted. Never keystrokes, values, or value lengths |
| `error` | Uncaught exceptions and unhandled rejections with `exception.type`, `exception.message`, and `exception.stacktrace` |
| `network` | fetch and XHR calls with method, status, and duration — plus the trace context injected into them |
| `log` | Mirrored `console.error` / `console.warn` output, plus anything you send with `log()` |
| `custom` | Marks you add with `addEvent()` |

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

Backend log lines that run inside the extracted trace context then share a `trace_id` with the originating browser request. If your backend runs OpenTelemetry, that extraction already happens by default. Set `network: { sampledFlag: true }` if you also want your backend tracer to *record* those traces — the logs-side join works either way.

The SDK also records platform request ids echoed on responses (`x-request-id`, `cf-ray`, `x-vercel-id`, and similar) as `web.network.request_id`, giving you an exact join key against CDN and platform logs with no backend changes. Reading these cross-origin requires the header in `Access-Control-Expose-Headers`.

## Identify users

```ts
import { identify, reset } from "@sazabi/browser-sdk";

identify("user_123", { plan: "pro" }); // on sign-in — use your internal id, not an email
reset(); // on sign-out
```

`identify()` stamps `session.distinct_id` on subsequent events and records the traits on the identify event. `reset()` clears the identity and rotates the session and window ids, so activity on a shared device never threads into the previous user's timeline; switching identities without a `reset()` rotates automatically.

Identity is client-asserted — treat it as a claim, not as authentication.

## Logs, custom events, and console output

```ts
import { addEvent, log } from "@sazabi/browser-sdk";

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
| `network.allowlist` | same-origin only | Origins eligible for header injection |
| `network.sampledFlag` | `false` | Mark minted traces sampled (`-01`) for backend tracers |
| `network.resourceFallback` | `true` | Observe requests that bypass instrumentation |
| `network.requestIdHeaders` | common platform headers | Response headers probed for a request id |
| `console.capture` / `console.levels` | `true`, `["error", "warn"]` | Console mirroring |
| `input.capture` | `true` | Field-interaction episodes |
| `consent` | off | Hold all capture until it resolves true |
| `flushIntervalMs` | `5000` | Batch flush cadence |

## Privacy and safety

- **Input values, keystrokes, request bodies, and response bodies are never captured** — not even value lengths.
- Element names come from developer-authored sources only (`aria-label`, `<label>`, `placeholder`, button captions), and only for interactive elements. Clicks on plain containers, where user content lives, record selectors only.
- Add `data-sazabi-mask` to any element to suppress text capture for its whole subtree, or `data-sazabi-name` to set an element's reported name explicitly.
- Every patch is transparent, idempotent, and reversible. SDK failures are invisible to your app, and `shutdown()` restores the original functions.
- Events are delivered as OTLP/HTTP log records with batching, and flushed with `keepalive` when the tab closes.

## Verifying it works

Load your app and click through a few pages. The SDK flushes every 5 seconds and again when the tab is hidden or closed, so the first events land within about 10 seconds. In your browser's network tab, filter for `intake` — POSTs to `/v1/logs` should return 200.

Full setup guide and troubleshooting: [docs.sazabi.com/data/log-sources/endpoint/web](https://docs.sazabi.com/data/log-sources/endpoint/web).
