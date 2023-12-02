import "./RoomDialog.scss";
import { AppState } from "../../types";
declare const RoomDialog: ({ handleClose, activeRoomLink, username, onUsernameChange, onRoomCreate, onRoomDestroy, setErrorMessage, theme, }: {
    handleClose: () => void;
    activeRoomLink: string;
    username: string;
    onUsernameChange: (username: string) => void;
    onRoomCreate: () => void;
    onRoomDestroy: () => void;
    setErrorMessage: (message: string) => void;
    theme: AppState["theme"];
}) => JSX.Element;
export default RoomDialog;
