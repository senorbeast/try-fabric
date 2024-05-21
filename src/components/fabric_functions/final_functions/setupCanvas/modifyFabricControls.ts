import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import {
    lockOptions,
    cloneIcon,
    rotateIcon,
    deleteIcon,
    lockIcon,
} from "../constants";

export const modifyFabricControls = () => {
    // Other canvas setup logic here
    fabric.Object.prototype.set({
        transparentCorners: false,
        borderColor: "#333333",
        cornerColor: "#333333",
        cornerSize: 10,
        cornerStyle: "circle",
    });

    fabric.Object.prototype.setControlsVisibility({
        tl: true,
        mt: true,
        tr: true,
        ml: true,
        mr: true,
        bl: true,
        mb: true,
        br: true,
        mtr: false,
    });

    fabric.Object.prototype.controls.clone = new fabric.Control({
        x: 0,
        y: 0.5,
        offsetY: 30,
        offsetX: -45,
        cursorStyle: "pointer",
        mouseUpHandler: cloneObject,
        render: renderIcon(createElementIcon(cloneIcon)),
        withConnection: false,
        actionName: "clone",
    });

    fabric.Object.prototype.controls.rotate = new fabric.Control({
        x: 0,
        y: 0.5,
        offsetY: 30,
        offsetX: -15,
        cursorStyle: "pointer",
        //@ts-expect-error this works
        actionHandler: fabric.controlsUtils.rotationWithSnapping,
        actionName: "rotate",
        render: renderIcon(createElementIcon(rotateIcon)),
        withConnection: false,
    });

    fabric.Object.prototype.controls.delete = new fabric.Control({
        x: 0,
        y: 0.5,
        offsetY: 30,
        offsetX: 15,
        cursorStyle: "pointer",
        mouseUpHandler: deleteObject,
        render: renderIcon(createElementIcon(deleteIcon)),
        withConnection: false,
        actionName: "delete",
    });

    fabric.Object.prototype.controls.lock = new fabric.Control({
        x: 0,
        y: 0.5,
        offsetY: 30,
        offsetX: 45,
        cursorStyle: "pointer",
        mouseUpHandler: lockObject,
        render: renderIcon(createElementIcon(lockIcon)),
        withConnection: false,
        actionName: "lock",
    });

    // (fabric.Object.prototype.controls.delete as CustomControl).cornerSize = 26;
};

const createElementIcon = (svg: string): HTMLImageElement => {
    const imgElement = document.createElement("img");
    imgElement.src = "data:image/svg+xml;base64," + btoa(svg);
    return imgElement;
};

function renderIcon(icon: HTMLImageElement): fabric.Control["render"] {
    return (ctx, left, top, _, fabricObject) => {
        const size = 26; //this.cornerSize;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
        ctx.drawImage(icon, -size / 2, -size / 2, size + 2, size);
        ctx.restore();
    };
}

export function cloneGroup(grpObj: fabric.Group): fabric.Group {
    const newGroup = new fabric.Group([], {
        commonID: uuidv4(),
        name: "groupObj",
    });
    const objs = grpObj.getObjects();

    objs.forEach((obj) => {
        obj.clone((cloned: fabric.Object) => {
            newGroup.add(cloned);
        });
    });
    return newGroup;
}

function cloneObject(
    _: MouseEvent,
    transform: fabric.Transform,
    x: number,
    y: number
) {
    const target = transform.target;
    const canvas = target.canvas!;

    target.clone((cloned: fabric.Object) => {
        const id = uuidv4();
        cloned.set({ commonID: id, left: x, top: y });
        canvas.add(cloned);
    });

    // const newGroup = cloneGroup(target as fabric.Group);
    // newGroup.set({ left: x, top: y });
    // canvas.add(newGroup);
    canvas.renderAll();
    return true;
}

function deleteObject(_: MouseEvent, transform: fabric.Transform) {
    const target = transform.target;
    const canvas = target.canvas!;
    canvas.remove(target);
    return true;
}

function lockObject(_: MouseEvent, transform: fabric.Transform) {
    const target = transform.target;
    const canvas = target.canvas!;
    target.set(lockOptions);
    canvas.renderAll();
    return true;
}
