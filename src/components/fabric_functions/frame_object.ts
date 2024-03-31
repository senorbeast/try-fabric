import type { fabricRefType } from "../Canvas";
import { fabric } from "fabric";
import { onObjectSelected, onSelectionCleared } from "./cubic";
import { imageObject } from "./common";
import {
    findEquidistantPoints,
    getReqObjByNames,
    setObjsOptions,
} from "./helpers";

const endPointOffset = 16;
const controlPointOffset = 8;

const unMovableOptions: fabric.IObjectOptions = {
    evented: false,
    selectable: false,
    lockMovementX: true,
    lockMovementY: true,
    hasControls: false,
    hasBorders: false,
};
const commonOptions: fabric.IObjectOptions = {
    commonID: "someUUID",
    initialFrame: 0,
    currentType: "point",
};

export const extraProps = [
    "name",
    "line1",
    "line2",
    "line3",
    "line4",
    "objectCaching",
    "path",
    "height",
    "width",
    "currentFrame",
    ...Object.keys(commonOptions),
    ...Object.keys(unMovableOptions),
];

export const frameObject = (
    fabricRef: fabricRefType,
    startPoint: [number, number],
    endPoint: [number, number],
    commonID: string,
    name: string
) => {
    const canvas = fabricRef.current!;

    const [store] = getReqObjByNames(canvas, ["invisibleStore"]);
    const currentFrame = store!.currentFrame;

    const [p0, p3] = makeEndPoints(startPoint, endPoint);
    p0.set({ opacity: 0.5, ...commonOptions, ...unMovableOptions });
    canvas.add(p3);

    setObjsOptions([p0, p3], { initialFrame: currentFrame });

    if (currentFrame > 0 && currentFrame > initialFrame) {
        updatePointToLine(fabricRef, startPoint, endPoint, p0, p3);
    }
};

function updatePointToLine(
    fabricRef: fabricRefType,
    startPoint: [number, number],
    endPoint: [number, number],
    p0: fabric.Object,
    p3: fabric.Object
) {
    const canvas = fabricRef.current!;
    const line = makeLinePath(startPoint, endPoint, "frame_line");
    linkEndPointsToLine(line, p0, p3);
    setObjsOptions([line, p0, p3], { currentType: "line" });
    [line, p0].map((o) => canvas.add(o));
}

function makeLinePath(
    startPoint: [number, number],
    endPoint: [number, number],
    name: string
): fabric.Path {
    const line = new fabric.Path(
        `M ${startPoint[0]} ${startPoint[1]} L ${endPoint[0]} ${endPoint[1]}`,
        {
            fill: "",
            stroke: "black",
            objectCaching: false,
            strokeUniform: true,
            strokeDashArray: [5, 5],
        }
    );

    line.path[0][1] = startPoint[0];
    line.path[0][2] = startPoint[1];
    line.path[1][1] = endPoint[0];
    line.path[1][2] = endPoint[1];

    line.set({
        name: name,
        ...commonOptions,
        ...unMovableOptions,
    });

    return line;
}

function makeEndPoints(
    startPoint: number[],
    endPoint: number[]
): fabric.Object[] {
    // Add start point
    const p0 = makeCustomEndPoint(startPoint[0], startPoint[1]);
    p0.name = "p0";

    // Add end point
    const p3 = makeCustomEndPoint(endPoint[0], endPoint[1]);
    p3.name = "p3";

    return [p0, p3];
}

function makeCustomEndPoint(left: number, top: number) {
    const c = imageObject("my-image");
    c.set({
        left: left - 16,
        top: top - 16,
    });
    return c;
}

function makeControlsPoints(
    controlPoint1: number[],
    controlPoint2: number[]
): fabric.Object[] {
    // Add 1st control point
    const p1 = makeControlPoint(controlPoint1[0], controlPoint1[1]);
    p1.name = "p1";

    // Add 2nd control point
    const p2 = makeControlPoint(controlPoint2[0], controlPoint2[1]);
    p2.name = "p2";

    return [p1, p2];
}

function makeControlPoint(left: number, top: number) {
    const c = new fabric.Circle({
        left: left - 8,
        top: top - 8,
        radius: 8,
        fill: "#fff",
    });

    return c;
}

function linkEndPointsToLine(
    line: fabric.Path,
    p0: fabric.Object,
    p3: fabric.Object
) {
    const ptsArr = [p0, p3];
    ptsArr.forEach((pt) => {
        pt.hasBorders = pt.hasControls = false;
        pt.line1 = null;
        pt.line2 = null;
        pt.line3 = null;
        pt.line4 = null;
    });
    // Connect existing points with the path line
    p0.line1 = line;
    p3.line4 = line;
}

function linkControlPointsToLine(
    line: fabric.Path,
    p1: fabric.Object,
    p2: fabric.Object
) {
    const ptsArr = [p1, p2];
    ptsArr.forEach((pt) => {
        pt.hasBorders = pt.hasControls = false;
        pt.line1 = null;
        pt.line2 = null;
        pt.line3 = null;
        pt.line4 = null;
    });
    // Connect existing points with the path line
    p1.line2 = line;
    p2.line3 = line;
}

function unLinkControlPointsFromLine(p1: fabric.Object, p2: fabric.Object) {
    const ptsArr = [p1, p2];
    ptsArr.forEach((pt) => {
        pt.hasBorders = pt.hasControls = false;
        pt.line1 = null;
        pt.line2 = null;
        pt.line3 = null;
        pt.line4 = null;
    });
}

export function runAfterJSONLoad(fabricRef: fabricRefType) {
    const canvas = fabricRef.current!;
    const [line, p0, p3] = getReqObjByNames(canvas, ["frame_line", "p0", "p3"]);
    linkEndPointsToLine(line, p0, p3);
    bindFOEvents(canvas);
}

type objectCurrentType = "point" | "line" | "curve";

export function bindFOEvents(fabricRef: fabricRefType) {
    // TODO: remove this workaround
    // fix for loading cbc, after line properly
    // canvas.__eventListeners = {};
    const canvas = fabricRef.current!;
    canvas.on({
        "object:moving": (e: fabric.IEvent<MouseEvent>) =>
            onObjectMoving(e, canvas),
    });

    canvas.on({
        "object:selected": (e: fabric.IEvent<MouseEvent>) =>
            onObjectSelected(e, canvas),
        "object:moving": (e: fabric.IEvent<MouseEvent>) =>
            onFOMovingLine(e, canvas),
        "selection:cleared": (e: fabric.IEvent<MouseEvent>) =>
            onSelectionCleared(e, canvas),
        "mouse:up": (e: fabric.IEvent<MouseEvent>) =>
            onObjectMouseUp(e, canvas),
        "mouse:down": (e: fabric.IEvent<MouseEvent>) =>
            onObjectMouseDown(e, canvas),
    });
}

// Convert Line to Cubic Beizer
// !FIX: This event is triggered multiple times
function onObjectMouseUp(e: fabric.IEvent<MouseEvent>, canvas: fabric.Canvas) {
    // When endpoint released
    updateLineToCurve(e, "", canvas);
}

function updateLineToCurve(
    e: fabric.IEvent<MouseEvent>,
    commonID: string,
    canvas: fabric.Canvas
) {
    const [line] = getReqObjByNames(canvas, ["frame_line", "p0", "p3"]);
    const [p1, p2] = getReqObjByNames(canvas, ["p1", "p2"]);
    // When endpoint released
    if (e.target!.name == "p3" && (p1 == null || p2 == null)) {
        // add p1, p2 controls points, make it a beizer curve
        const path = line!.path;
        const startPoint: [number, number] = [path[0][1], path[0][2]];
        const endPoint: [number, number] = [path[1][5], path[1][6]];
        const [controlPoint1, controlPoint2] = findEquidistantPoints(
            startPoint,
            endPoint
        );
        line.path[1] = [
            "C",
            controlPoint1[0],
            controlPoint1[1],
            controlPoint2[0],
            controlPoint2[1],
            endPoint[0],
            endPoint[1],
        ];

        const [p1, p2] = makeControlsPoints(controlPoint1, controlPoint2);
        linkControlPointsToLine(line, p1, p2);
        canvas.on({
            "object:moving": (e: fabric.IEvent<MouseEvent>) =>
                onObjectMoving(e, canvas),
        });
        [p1, p2].map((o) => canvas.add(o));
        canvas.renderAll.bind(canvas);
    }
}

// Convert Cubic Beizer to Line
function onObjectMouseDown(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
    if (e.target!.name == "p3") {
        updateCurveToLine("", canvas);
    }
}

function updateCurveToLine(commonID: string, canvas: fabric.Canvas) {
    // remove p1, p2 controls points, make it a line
    const [line, p1, p2] = getReqObjByNames(canvas, ["frame_line", "p1", "p2"]);
    const path = line.path;
    const endPoint = [path[1][5], path[1][6]];
    canvas.remove(p1, p2);
    line.path[1] = ["L", endPoint[0], endPoint[1]];
    canvas.on({
        "object:moving": (e: fabric.IEvent<MouseEvent>) =>
            onFOMovingLine(e, canvas),
    });
    canvas.renderAll.bind(canvas);
}

function onFOMovingLine(e: fabric.IEvent<MouseEvent>, canvas?: fabric.Canvas) {
    if (e.target!.name === "p0" || e.target!.name === "p3") {
        const p = e.target!;
        if (p.line1) {
            p.line1.path[0][1] = p.left + endPointOffset;
            p.line1.path[0][2] = p.top + endPointOffset;
        } else if (p.line4) {
            p.line4.path[1][1] = p.left + endPointOffset;
            p.line4.path[1][2] = p.top + endPointOffset;
        }
    }
}

// TODO: Next onMouseDragOver, convert the line into a cubic beizer curve
// update line name, line path
// will require default control points
// add control points icons
// link them with line
// add proper event handlers

// # PRIORITY Add ids with uuid + prepend text like line, p0... for runAfterloaders

//# Frame stuff
// for next frame load, line into previous frames' endPoint

function onObjectMoving(e: fabric.IEvent<MouseEvent>, canvas?: fabric.Canvas) {
    if (e.target!.name === "p0" || e.target!.name === "p3") {
        const p = e.target!;
        if (p.line1) {
            p.line1.path[0][1] = p.left + endPointOffset;
            p.line1.path[0][2] = p.top + endPointOffset;
        } else if (p.line4) {
            p.line4.path[1][5] = p.left + endPointOffset;
            p.line4.path[1][6] = p.top + endPointOffset;
        }
    } else if (e.target!.name === "p1") {
        const p = e.target;
        if (p.line2) {
            p.line2.path[1][1] = p.left + controlPointOffset;
            p.line2.path[1][2] = p.top + controlPointOffset;
        }
    } else if (e.target!.name === "p2") {
        const p = e.target;
        if (p.line3) {
            p.line3.path[1][3] = p.left + controlPointOffset;
            p.line3.path[1][4] = p.top + controlPointOffset;
        }
    }
}
