import type { JsonValue } from '@/types/json';

function normalize(value: JsonValue, seen: WeakSet<object>): JsonValue {
    if (value === null) return null;
    if (typeof value !== 'object') return value;

    if (seen.has(value)) {
        throw new TypeError('Cannot canonicalize cyclic structures');
    }
    seen.add(value);

    if (Array.isArray(value)) {
        return value.map((item) => normalize(item as JsonValue, seen)) as JsonValue;
    }

    const entries = Object.keys(value as Record<string, JsonValue>).sort();
    const output: Record<string, JsonValue> = {};
    for (const key of entries) {
        const child = (value as Record<string, JsonValue>)[key];
        output[key] = normalize(child as JsonValue, seen);
    }
    seen.delete(value);
    return output as JsonValue;
}

/**
 * Returns a canonical JSON string with sorted object keys so the output is
 * stable across runs. Throws if the payload contains cyclic references.
 */
export function canonicalJson(value: JsonValue): string {
    const seen = new WeakSet<object>();
    return JSON.stringify(normalize(value, seen));
}
