import "./Menu.scss";
interface MenuProps {
    icon: JSX.Element;
    onClick: () => void;
    label: string;
    dataTestId: string;
    shortcut?: string;
    isCollaborating?: boolean;
}
declare const MenuItem: ({ icon, onClick, label, dataTestId, shortcut, isCollaborating, }: MenuProps) => JSX.Element;
export default MenuItem;
