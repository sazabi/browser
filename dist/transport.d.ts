import type { EventAttributes, EventSeverity, WebEvent } from "./types";
type OtlpAnyValue = {
    stringValue: string;
} | {
    intValue: string;
} | {
    doubleValue: number;
} | {
    boolValue: boolean;
};
interface OtlpKeyValue {
    key: string;
    value: OtlpAnyValue;
}
export interface OtlpLogRecord {
    timeUnixNano: string;
    severityNumber: number;
    severityText: EventSeverity;
    body: {
        stringValue: string;
    };
    attributes: OtlpKeyValue[];
    /** OTLP/JSON encodes trace/span ids as hex (unlike proto3 JSON's base64). */
    traceId?: string;
    spanId?: string;
}
export declare const encodeLogRecord: (event: WebEvent, baseAttributes: EventAttributes) => OtlpLogRecord;
export interface TransportOptions {
    /** Full OTLP logs endpoint, e.g. `https://web.<region>.intake.<domain>/v1/logs`. */
    url: string;
    publicKey: string;
    resourceAttributes: EventAttributes;
    /**
     * The fetch to deliver with — captured before the SDK's network patch
     * installs, so exporter traffic can never recurse through our own wrapper
     * or appear in the captured event stream.
     */
    fetchImpl: typeof fetch;
    flushIntervalMs: number;
    maxBatchBytes: number;
    maxQueuedEvents: number;
}
export interface Transport {
    enqueue(record: OtlpLogRecord): void;
    /**
     * Deliver everything queued. `keepalive: true` is for unload paths — each
     * request body must stay inside the browser's ~64 KiB keepalive budget,
     * which enqueue-side chunking guarantees via `maxBatchBytes`.
     */
    flush(options?: {
        keepalive?: boolean;
    }): Promise<void>;
    shutdown(): Promise<void>;
}
export declare const createTransport: (options: TransportOptions) => Transport;
export {};
