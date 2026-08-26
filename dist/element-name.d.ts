/**
 * Human-readable element names for timeline events — a pragmatic subset of
 * the ARIA accessible-name computation, biased hard toward developer-authored
 * sources. The bright line: app-authored static text (labels, aria-label,
 * placeholder, button captions) is capturable; user-reflected text (values,
 * selected options, data rendered into the DOM) is not. `data-sazabi-name`
 * overrides any element's reported name; `data-sazabi-mask` on an ancestor
 * suppresses name capture for the whole subtree.
 */
/**
 * Name for an input/textarea/select/contenteditable — developer-authored
 * sources only; the field's value and (for selects) the chosen option text
 * are never read.
 */
export declare const computeInputName: (element: Element) => string | undefined;
/**
 * Name for a click target: nearest interactive ancestor's accessible-ish
 * name. Residual risk is labels that interpolate user data ("Delete 'My
 * Project'") — that is app-authored markup, capped at 64 chars, and
 * suppressible via `data-sazabi-mask` / overridable via `data-sazabi-name`.
 */
export declare const computeClickName: (target: Element) => string | undefined;
