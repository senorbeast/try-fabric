import { useMemo } from "react";
import { contextMenuS } from "./react-ridge";
import { getReqObjBy } from "./fabric_functions/helpers";
import { fabricRefType } from "./Canvas";
import { fabric } from "fabric";

const ContextMenu = ({ fabricRef }: { fabricRef: fabricRefType }) => {
    const [menu, setMenu] = contextMenuS.use();

    const fabObj = useMemo(() => {
        const commonID = menu.commonID;
        const canvas = fabricRef.current!;
        if (canvas) {
            return getReqObjBy(canvas, "commonID", commonID)[0] as fabric.Group;
        }
        return null;
    }, [fabricRef, menu.commonID]);

    function getTextValue(fabGrp: fabric.Group) {
        const textTag: fabric.Text = fabGrp._objects.filter(
            (obj) => obj.name == "textName"
        )[0] as fabric.Text;
        textTag.text;
        return (textTag.text as string) || "";
    }
    const options = ["", "Winger", "Forward", "Defender"];

    const closeMenu = () => setMenu({ left: 0, top: 0, commonID: "" });

    return (
        <>
            {menu.left !== 0 ? (
                <div
                    className="absolute w-[800px] h-[500px]"
                    onClick={() => closeMenu()}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        closeMenu();
                    }}
                >
                    <div
                        style={{ left: menu.left, top: menu.top + 40 }}
                        className={`absolute bg-white flex flex-col justify-center items-center text-black rounded-lg p-2`}
                        onClick={(e) => e.stopPropagation()}
                        onContextMenu={(e) => e.stopPropagation()}
                    >
                        <p>Change player name</p>
                        <input
                            className="caret-black border-2 border-black "
                            placeholder="Enter name"
                            defaultValue={getTextValue(fabObj!)}
                            onChange={(e) => {
                                const canvas = fabricRef.current!;
                                const fabGrp = fabObj as fabric.Group;
                                const textTag: fabric.Text =
                                    fabGrp._objects.filter(
                                        (obj) => obj.name == "textName"
                                    )[0] as fabric.Text;
                                textTag.set({ text: e.target.value });
                                canvas.renderAll();
                            }}
                        />
                        <div className="flex">
                            Tag:
                            <select
                                name="tag-names"
                                id="tag-names"
                                onChange={(e) => {
                                    const canvas = fabricRef.current!;
                                    const fabGrp = fabObj as fabric.Group;
                                    const textTag: fabric.Text =
                                        fabGrp._objects.filter(
                                            (obj) => obj.name == "textTag"
                                        )[0] as fabric.Text;
                                    textTag.set({ text: e.target.value });
                                    canvas.renderAll();
                                    closeMenu();
                                }}
                            >
                                {options.map((option) => (
                                    <option role="button" key={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default ContextMenu;
