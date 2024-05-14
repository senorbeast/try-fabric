import { contextMenuS } from "./react-ridge";

const ContextMenu = () => {
    const [menu, setMenu] = contextMenuS.use();
    console.log(menu);
    return (
        <>
            {menu.left !== 0 ? (
                <div
                    className="absolute w-[800px] h-[500px] border-2 border-red-700"
                    onClick={() => setMenu({ left: 0, top: 0, staticID: "" })}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setMenu({ left: 0, top: 0, staticID: "" });
                    }}
                >
                    <div
                        style={{ left: menu.left, top: menu.top + 40 }}
                        className={`absolute bg-white text-black rounded-lg`}
                    >
                        Context Menu
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default ContextMenu;
