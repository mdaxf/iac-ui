/// <reference types="socket.io-client" />
/// <reference types="lodash" />
import { SocketUpdateData, SocketUpdateDataSource } from "../data";
import { TCollabClass } from "./Collab";
import { ExcalidrawElement } from "../../element/types";
import { WS_SCENE_EVENT_TYPES } from "../app_constants";
import { UserIdleState } from "../../types";
declare class Portal {
    collab: TCollabClass;
    socket: SocketIOClient.Socket | null;
    socketInitialized: boolean;
    roomId: string | null;
    roomKey: string | null;
    broadcastedElementVersions: Map<string, number>;
    constructor(collab: TCollabClass);
    open(socket: SocketIOClient.Socket, id: string, key: string): SocketIOClient.Socket;
    close(): void;
    isOpen(): boolean;
    _broadcastSocketData(data: SocketUpdateData, volatile?: boolean): Promise<void>;
    queueFileUpload: import("lodash").DebouncedFunc<() => Promise<void>>;
    broadcastScene: (updateType: WS_SCENE_EVENT_TYPES.INIT | WS_SCENE_EVENT_TYPES.UPDATE, allElements: readonly ExcalidrawElement[], syncAll: boolean) => Promise<void>;
    broadcastIdleChange: (userState: UserIdleState) => Promise<void> | undefined;
    broadcastMouseLocation: (payload: {
        pointer: SocketUpdateDataSource["MOUSE_LOCATION"]["payload"]["pointer"];
        button: SocketUpdateDataSource["MOUSE_LOCATION"]["payload"]["button"];
    }) => Promise<void> | undefined;
}
export default Portal;
