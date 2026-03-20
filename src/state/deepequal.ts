/**
 * Deep equality comparison utility.
 * Handles numbers (including NaN), null/undefined, primitives,
 * circular references, arrays, and objects.
 * Properties starting with underscore are ignored (consistent with on-change config).
 */
export function deepEqual(obj1: unknown, obj2: unknown, visitedObjects = new WeakSet()): boolean {
    // Numbers (special case for NaN)
    if (typeof obj1 === 'number' && typeof obj2 === 'number') {
        if (Number.isNaN(obj1) && Number.isNaN(obj2)) {
            return true;
        }
        return obj1 === obj2;
    }

    // Null or undefined
    if (obj1 === null || obj2 === null || obj1 === undefined || obj2 === undefined) {
        return obj1 === obj2;
    }

    // Primitives (string, boolean, symbol, bigint, function)
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return obj1 === obj2;
    }

    // Circular references
    if (visitedObjects.has(obj1 as object) || visitedObjects.has(obj2 as object)) {
        return obj1 === obj2;
    }

    // Mark as visited
    visitedObjects.add(obj1 as object);
    visitedObjects.add(obj2 as object);

    // Arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        return obj1.every((item, i) => deepEqual(item, obj2[i], visitedObjects));
    }

    // Objects — ignore properties starting with underscore (coherent with on-change config)
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
        const record1 = obj1 as Record<string, unknown>;
        const record2 = obj2 as Record<string, unknown>;
        const keys1 = Object.keys(record1).filter((key) => !key.startsWith('_'));
        const keys2 = Object.keys(record2).filter((key) => !key.startsWith('_'));

        if (keys1.length !== keys2.length) {
            return false;
        }

        return keys1.every((key) => {
            if (!Object.prototype.hasOwnProperty.call(record2, key)) {
                return false;
            }
            return deepEqual(record1[key], record2[key], visitedObjects);
        });
    }

    throw Error('Unmanaged case for equality check');
}
