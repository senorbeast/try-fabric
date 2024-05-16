import { useMemo, useState } from "react";
import { fabricRefType } from "./Canvas";
import { fabric } from "fabric";
import {
    lockOptions,
    unlockOptions,
} from "./fabric_functions/final_functions/constants";
import { getReqObjBy } from "./fabric_functions/final_functions/frameObject/helpers/getterSetters";
import { contextMenuS } from "./fabric_functions/final_functions/react-ridge";

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
        const textTag: fabric.Text = fabGrp.getObjects().filter(
            // @ts-expect-error type is text
            (obj) => obj.type == "text" && obj.fontSize == 15
        )[0] as fabric.Text;
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
                        className="absolute bg-white flex gap-2 flex-col justify-center items-center text-black rounded-lg p-2"
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
                                const textTag: fabric.Text = fabObj!
                                    .getObjects()
                                    .filter(
                                        (obj) =>
                                            obj.type == "text" &&
                                            // @ts-expect-error type is text
                                            obj.fontSize == 15
                                    )[0] as fabric.Text;
                                textTag.set({ text: e.target.value });
                                canvas.renderAll();
                            }}
                            onSubmit={closeMenu}
                        />
                        <div className="flex">
                            Tag:
                            <select
                                name="tag-names"
                                id="tag-names"
                                onChange={(e) => {
                                    const canvas = fabricRef.current!;
                                    const textTag: fabric.Text = fabObj!
                                        .getObjects()
                                        .filter(
                                            (obj) =>
                                                obj.type == "text" &&
                                                // @ts-expect-error type is text
                                                obj.fontSize == 10
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
                        <ToogleLock
                            objLock={!fabObj?.hasBorders}
                            fabObj={fabObj!}
                            closeMenu={closeMenu}
                        />
                    </div>
                </div>
            ) : null}
        </>
    );
};

const ToogleLock = ({
    objLock,
    fabObj,
    closeMenu,
}: {
    objLock: boolean;
    fabObj: fabric.Object;
    closeMenu: () => void;
}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [lock, setLock] = useState(objLock);
    return (
        <button
            className="flex gap-2"
            onClick={() => {
                closeMenu();
                // setLock(!lock);
                fabObj.set(lock ? unlockOptions : lockOptions);
                const canvas = fabObj.canvas;
                canvas?.renderAll();
            }}
        >
            {lock ? (
                <>
                    <p>Unlock</p> <UnlockIcon />
                </>
            ) : (
                <>
                    <p>Lock</p> <LockIcon />
                </>
            )}
        </button>
    );
};

const UnlockIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24"
    >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" />
    </svg>
);

const LockIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 0 24 24"
        width="24"
    >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
);

export default ContextMenu;
