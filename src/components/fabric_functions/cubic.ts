import type { fabricRefType } from "../Canvas";
import { fabric } from "fabric";
import { calculateControlPoints, getReqObjByIds } from "./helpers";

export const drawCubic = (fabricRef: fabricRefType) => {
    const canvas = fabricRef.current!;

    const startPoint = [100, 100];
    const controlPoint1 = [200, 100];
    const controlPoint2 = [300, 100];
    const endPoint = [400, 100];

    const line = new fabric.Path(
        `M ${startPoint[0]} ${startPoint[1]} C ${controlPoint1[0]}, ${controlPoint1[1]}, ${controlPoint2[0]}, ${controlPoint2[1]}, ${endPoint[0]}, ${endPoint[1]}`,
        {
            fill: "",
            stroke: "black",
            objectCaching: false,
        }
    );

    line.path[0][1] = 100;
    line.path[0][2] = 100;
    line.path[1][1] = 200;
    line.path[1][2] = 200;
    line.path[1][3] = 300;
    line.path[1][4] = 200;
    line.path[1][5] = 400;
    line.path[1][6] = 100;

    line.name = "cubeLine";
    canvas.add(line);

    const [cp1, cp2] = calculateControlPoints(
        startPoint,
        controlPoint1,
        controlPoint2,
        endPoint
    );

    const newCP1 = makeControlPoint(cp1[0], cp1[1]);
    newCP1.name = "newCP1";
    const newCP2 = makeControlPoint(cp2[0], cp2[1]);
    newCP2.name = "newCP2";

    const [p0, p1, p2, p3] = addPathPoints(
        canvas,
        startPoint,
        controlPoint1,
        controlPoint2,
        endPoint,
        line
    );
    linkPointsToLine(line, p0, p1, p2, p3);
    bindCubicEvents(canvas);
    // [p0, p1, p2, p3].map((o) => canvas.add(o));
    [p0, p1, p2, p3, newCP1, newCP2].map((o) => canvas.add(o));
};

type pathORNull = fabric.Path | null;

export function makeEndPoint(left: number, top: number) {
    const c = new fabric.Circle({
        left: left - 16,
        top: top - 16,
        strokeWidth: 4,
        radius: 12,
        fill: "#fff",
        stroke: "#666",
    });

    return c;
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

function addPathPoints(
    canvas: fabric.Canvas,
    startPoint,
    controlPoint1,
    controlPoint2,
    endPoint,
    line
) {
    // Add 1st control point
    const p1 = makeControlPoint(controlPoint1[0], controlPoint1[1]);
    p1.name = "p1";

    // Add 2nd control point
    const p2 = makeControlPoint(controlPoint2[0], controlPoint2[1]);
    p2.name = "p2";

    // Add start point
    const p0 = makeEndPoint(startPoint[0], startPoint[1]);
    p0.name = "p0";

    // Add end point
    const p3 = makeEndPoint(endPoint[0], endPoint[1]);
    p3.name = "p3";

    return [p0, p1, p2, p3];
}

function linkPointsToLine(line, p0, p1, p2, p3) {
    const ptsArr = [p0, p1, p2, p3];
    ptsArr.forEach((pt) => {
        pt.hasBorders = pt.hasControls = false;
        pt.line1 = null;
        pt.line2 = null;
        pt.line3 = null;
        pt.line4 = null;
    });
    // Connect existing points with the path line
    p0.line1 = line;
    p1.line2 = line;
    p2.line3 = line;
    p3.line4 = line;
}

function bindCubicEvents(canvas: fabric.Canvas) {
    canvas.on({
        "object:selected": (e: fabric.IEvent<MouseEvent>) =>
            onObjectSelected(e, canvas),
        "object:moving": (e: fabric.IEvent<MouseEvent>) =>
            onObjectMoving(e, canvas),
        "selection:cleared": (e: fabric.IEvent<MouseEvent>) =>
            onSelectionCleared(e, canvas),
    });
}

export function addCBCHelpers(
    fabricRef: fabricRefType,
    lineName: string,
    replace?: boolean
) {
    // This is required all canvas JSON is loaded,
    // these objects/functionality is not stored in the json

    const canvas = fabricRef.current!;
    // const { line, points } = getReqObj(canvas);
    const [line, p0, p1, p2, p3] = getReqObjByIds(canvas, [
        lineName,
        "p0",
        "p1",
        "p2",
        "p3",
    ]);
    if (replace) {
        console.log("Replacing points");
        // Replace old points with new
        // Extract details
        const path = line.path;
        const startPoint = [path[0][1], path[0][2]];
        const controlPoint1 = [path[1][1], path[1][2]];
        const controlPoint2 = [path[1][3], path[1][4]];
        const endPoint = [path[1][5], path[1][6]];

        canvas.remove(...points);
        const [p0, p1, p2, p3] = addPathPoints(
            canvas,
            startPoint,
            controlPoint1,
            controlPoint2,
            endPoint,
            line
        );
        linkPointsToLine(line, p0, p1, p2, p3);
        [p0, p1, p2, p3].map((o) => canvas.add(o));
    } else {
        console.log("Linking existing points");
        line!.height = 0;
        line!.width = 0;
        // Link existing points
        // const [p0, p1, p2, p3] = points;
        linkPointsToLine(line, p0, p1, p2, p3);
    }

    bindCubicEvents(canvas);
}

export function onObjectSelected(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
    const activeObject = e.target!;
    if (activeObject.name === "p0" || activeObject.name === "p3") {
        activeObject.line2.animate("opacity", "1", {
            duration: 200,
            onChange: canvas.renderAll.bind(canvas),
        });
        activeObject.line2.selectable = true;
    } else {
        console.log(activeObject);
    }
}

export function onSelectionCleared(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
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

function onObjectMoving(e: fabric.IEvent<MouseEvent>, canvas?: fabric.Canvas) {
    const endPointOffset = 16;
    const controlPointOffset = 8;

    // const { line, points } = getReqObj(canvas);
    const [line, newCP1, newCP2] = getReqObjByIds(canvas!, [
        "cubeLine",
        "newCP1",
        "newCP2",
    ]);
    const path = line.path;
    const startPoint = [path[0][1], path[0][2]];
    const controlPoint1 = [path[1][1], path[1][2]];
    const controlPoint2 = [path[1][3], path[1][4]];
    const endPoint = [path[1][5], path[1][6]];

    const [cp1, cp2] = calculateControlPoints(
        startPoint,
        controlPoint1,
        controlPoint2,
        endPoint
    );
    console.log(newCP1, newCP2);
    newCP1.set({ left: cp1[0], top: cp1[1] });
    newCP2.set({ left: cp2[0], top: cp2[1] });
    canvas?.renderAll.bind(canvas);

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
