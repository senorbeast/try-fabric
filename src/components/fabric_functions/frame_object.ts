import type { fabricRefType } from "../Canvas";
import { fabric } from "fabric";
import { onObjectMoving, onObjectSelected, onSelectionCleared } from "./cubic";
import { imageObject } from "./common";
import { getReqObjByIds } from "./helpers";

export const frameObject = (fabricRef: fabricRefType) => {
    const canvas = fabricRef.current!;

    const startPoint = [100, 100];
    const endPoint = [100, 100];

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

    line.name = "frame_line";
    canvas.add(line);

    const [p0, p3] = makeEndPoints(startPoint, endPoint);
    linkEndPointsToLine(line, p0, p3);
    bindFOEvents(canvas);
    [p0, p3].map((o) => canvas.add(o));
};

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

function linkEndPointsToLine(line, p0, p3) {
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

function linkControlPointsToLine(line, p1, p2) {
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

function unLinkControlPointsFromLine(p1, p2) {
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
    const [line, p0, p3] = getReqObjByIds(canvas, ["frame_line", "p0", "p3"]);
    linkEndPointsToLine(line, p0, p3);
    bindFOEvents(canvas);
}

function bindFOEvents(canvas: fabric.Canvas) {
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
function onObjectMouseUp(e: fabric.IEvent<MouseEvent>, canvas: fabric.Canvas) {
    console.log("on object mouse up");
    const [line] = getReqObjByIds(canvas, ["frame_line", "p0", "p3"]);
    if (e.target!.name == "p3") {
        // add p1, p2 controls points, make it a beizer curve

        const path = line!.path;
        const startPoint = [path[0][1], path[0][2]];
        // points inbetween of the line
        const controlPoint1 = [150, 100];
        const controlPoint2 = [200, 100];
        const endPoint = [path[1][5], path[1][6]];

        line.path[1] = [
            "C",
            controlPoint1[0],
            controlPoint1[1],
            controlPoint2[0],
            controlPoint2[1],
            endPoint[0],
            endPoint[1],
        ];
        canvas.renderCanvas.bind(canvas);
        const [p1, p2] = makeControlsPoints(controlPoint1, controlPoint2);
        linkControlPointsToLine(line, p1, p2);

        canvas.on({
            "object:moving": (e: fabric.IEvent<MouseEvent>) =>
                onObjectMoving(e, canvas),
        });

        [p1, p2].map((o) => canvas.add(o));
        canvas.renderCanvas.bind(canvas);
    }
}

// Convert Cubic Beizer to Line
function onObjectMouseDown(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
    console.log("on object mouse down");
    if (e.target!.name == "p3") {
        // remove p1, p2 controls points, make it a line
        const [line, p1, p2] = getReqObjByIds(canvas, [
            "frame_line",
            "p1",
            "p2",
        ]);
        const path = line.path;
        const endPoint = [path[1][5], path[1][6]];
        canvas.remove(p1, p2);
        line.path[1] = ["L", endPoint[0], endPoint[1]];
        canvas.on({
            "object:moving": (e: fabric.IEvent<MouseEvent>) =>
                onFOMovingLine(e, canvas),
        });
        canvas.renderCanvas.bind(canvas);
    }
}

function onFOMovingLine(e: fabric.IEvent<MouseEvent>, canvas?: fabric.Canvas) {
    const endPointOffset = 16;
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
