import type { fabricRefType } from "../Canvas";
import { fabric } from "./custom_attribute";
import { makeEndPoint } from "./cubic";
import { getReqObjByNames } from "./helpers";
import { onObjectSelected, onSelectionCleared } from "./final_functions/events";

export const drawLine = (fabricRef: fabricRefType) => {
    const canvas = fabricRef.current!;

    const startPoint = [100, 100];
    const endPoint = [400, 100];

    const line = new fabric.Path(
        `M ${startPoint[0]} ${startPoint[1]} L ${endPoint[0]} ${endPoint[1]}`,
        {
            fill: "",
            stroke: "black",
            objectCaching: false,
        }
    );

    line.path[0][1] = startPoint[0];
    line.path[0][2] = startPoint[1];
    line.path[1][1] = endPoint[0];
    line.path[1][2] = endPoint[1];

    line.name = "line";
    canvas.add(line);

    const [p0, p3] = addEndPoints(startPoint, endPoint);
    linkPointsToLine(line, p0, p3);
    bindLineEvents(canvas);
    [p0, p3].map((o) => canvas.add(o));
};

function addEndPoints(
    startPoint: number[],
    endPoint: number[]
): fabric.Object[] {
    // Add start point
    const p0 = makeEndPoint(startPoint[0], startPoint[1]);
    p0.name = "p0";

    // Add end point
    const p3 = makeEndPoint(endPoint[0], endPoint[1]);
    p3.name = "p3";

    return [p0, p3];
}

function linkPointsToLine(line, p0, p3) {
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

export function runAfterJSONLoadLine(fabricRef: fabricRefType) {
    const canvas = fabricRef.current!;
    const [line, p0, p3] = getReqObjByNames(canvas, ["line", "p0", "p3"]);
    linkPointsToLine(line, p0, p3);
    bindLineEvents(canvas);
}

function bindLineEvents(canvas: fabric.Canvas) {
    canvas.on({
        "object:selected": (e: fabric.IEvent<MouseEvent>) =>
            onObjectSelected(e, canvas),
        "object:moving": (e: fabric.IEvent<MouseEvent>) =>
            onObjectMoving(e, canvas),
        "selection:cleared": (e: fabric.IEvent<MouseEvent>) =>
            onSelectionCleared(e, canvas),
    });
}

function onObjectMoving(e: fabric.IEvent<MouseEvent>, canvas?: fabric.Canvas) {
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
