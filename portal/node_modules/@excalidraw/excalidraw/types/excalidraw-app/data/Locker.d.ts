export declare class Locker<T extends string> {
    private locks;
    lock: (lockType: T) => void;
    /** @returns whether no locks remaining */
    unlock: (lockType: T) => boolean;
    /** @returns whether some (or specific) locks are present */
    isLocked(lockType?: T): boolean;
}
