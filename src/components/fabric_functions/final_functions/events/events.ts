/* eslint-disable @typescript-eslint/no-unused-vars */
import { fabric } from "fabric";
import { fabricRefType } from "../../../Canvas";
import { onDrop } from "./onDrop";
import { onObjectMoving } from "./onMoving";
import { onObjectMouseDown } from "./onObjectMouseDown";
import { onObjectMouseUp } from "./onObjectMouseUp";
import { updateFramesData } from "../frameObject/core/updateFramesData";

export function bindFOEvents(fabricRef: fabricRefType) {
    // TODO: remove this workaround
    // fix for loading cbc, after line properly
    // canvas.__eventListeners = {};
    const canvas = fabricRef.current!;

    //@ts-expect-error All working
    canvas.on({
        "object:selected": (e: fabric.IEvent<MouseEvent>) =>
            onObjectSelected(e, canvas),
        "object:moving": (e: fabric.IEvent<MouseEvent>) =>
            onObjectMoving(e, canvas),
        "selection:cleared": (e: fabric.IEvent<MouseEvent>) =>
            onSelectionCleared(e, canvas),
        "mouse:up": (e: fabric.IEvent<MouseEvent>) =>
            onObjectMouseUp(e, canvas),
        "mouse:down": (e: fabric.IEvent<MouseEvent>) =>
            onObjectMouseDown(e, canvas),
        "object:modified": (e: fabric.IEvent<MouseEvent>) =>
            onObjectModified(e, canvas),
        "object:removed": (e: fabric.IEvent<MouseEvent>) =>
            onObjectModified(e, canvas),
        "object:added": (e: fabric.IEvent<MouseEvent>) =>
            onObjectAdded(e, canvas),
        drop: (e: fabric.IEvent<MouseEvent>) => onDrop(e, canvas),
        "selection:updated": (e: fabric.IEvent<MouseEvent>) =>
            onSelectionUpdated(e, canvas),
        "selection:created": (e: fabric.IEvent<MouseEvent>) =>
            onSelectionCreated(e, canvas),
    });
}

function onSelectionUpdated(
    _e: fabric.IEvent<MouseEvent>,
    _canvas: fabric.Canvas
) {
    // console.log(e, canvas);
    return;
}

function onSelectionCreated(
    _e: fabric.IEvent<MouseEvent>,
    _canvas: fabric.Canvas
) {
    // console.log(e, canvas);
    return;
}

function onObjectAdded(_e: fabric.IEvent<MouseEvent>, canvas: fabric.Canvas) {
    updateFramesData(canvas);
}

function onObjectModified(
    _e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
    updateFramesData(canvas);
}

export function onObjectSelected(
    e: fabric.IEvent<MouseEvent>,
    _canvas: fabric.Canvas
) {
    const activeObject = e.target!;
    // console.log(activeObject, canvas);
}

export function onSelectionCleared(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    e: fabric.IEvent<MouseEvent>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    canvas: fabric.Canvas
) {
    console.log(e, canvas);
    // const activeObject = e.target;
    // if (activeObject == null || activeObject == undefined) return null;
    // if (activeObject.name === "p0" || activeObject.name === "p3") {
    //     activeObject.line2.animate("opacity", "0", {
    //         duration: 200,
    //         onChange: canvas.renderAll.bind(canvas),
    //     });
    //     activeObject.line2.selectable = false;
    // } else if (activeObject.name === "p1" || activeObject.name === "p2") {
    //     activeObject.animate("opacity", "0", {
    //         duration: 200,
    //         onChange: canvas.renderAll.bind(canvas),
    //     });
    //     activeObject.selectable = false;
    // }
}
