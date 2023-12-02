export declare const SAVE_TO_LOCAL_STORAGE_TIMEOUT = 300;
export declare const INITIAL_SCENE_UPDATE_TIMEOUT = 5000;
export declare const FILE_UPLOAD_TIMEOUT = 300;
export declare const LOAD_IMAGES_TIMEOUT = 500;
export declare const SYNC_FULL_SCENE_INTERVAL_MS = 20000;
export declare const SYNC_BROWSER_TABS_TIMEOUT = 50;
export declare const CURSOR_SYNC_TIMEOUT = 33;
export declare const DELETED_ELEMENT_TIMEOUT: number;
export declare const FILE_UPLOAD_MAX_BYTES: number;
export declare const FILE_CACHE_MAX_AGE_SEC = 31536000;
export declare const WS_EVENTS: {
    SERVER_VOLATILE: string;
    SERVER: string;
};
export declare enum WS_SCENE_EVENT_TYPES {
    INIT = "SCENE_INIT",
    UPDATE = "SCENE_UPDATE"
}
export declare const FIREBASE_STORAGE_PREFIXES: {
    shareLinkFiles: string;
    collabFiles: string;
};
export declare const ROOM_ID_BYTES = 10;
export declare const STORAGE_KEYS: {
    readonly LOCAL_STORAGE_ELEMENTS: "excalidraw";
    readonly LOCAL_STORAGE_APP_STATE: "excalidraw-state";
    readonly LOCAL_STORAGE_COLLAB: "excalidraw-collab";
    readonly LOCAL_STORAGE_LIBRARY: "excalidraw-library";
    readonly LOCAL_STORAGE_THEME: "excalidraw-theme";
    readonly VERSION_DATA_STATE: "version-dataState";
    readonly VERSION_FILES: "version-files";
};
