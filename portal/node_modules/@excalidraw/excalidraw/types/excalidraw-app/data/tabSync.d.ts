declare const LOCAL_STATE_VERSIONS: {
    "version-dataState": number;
    "version-files": number;
};
declare type BrowserStateTypes = keyof typeof LOCAL_STATE_VERSIONS;
export declare const isBrowserStorageStateNewer: (type: BrowserStateTypes) => boolean;
export declare const updateBrowserStateVersion: (type: BrowserStateTypes) => void;
export declare const resetBrowserStateVersions: () => void;
export {};
