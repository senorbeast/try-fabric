import { fabricRefType } from "../../Canvas";
import { currentFrameS } from "../../react-ridge";
import {
    getReqObjByNamesForID,
    findEquidistantPoints,
    setObjsOptions,
} from "../helpers";
import { endPointOffset, controlPointOffset } from "./constants";
import { linkControlPointsToLine } from "./linkage";
import { makeControlsPoints } from "./makeUpdateObjects";

export function bindFOEvents(fabricRef: fabricRefType) {
    // TODO: remove this workaround
    // fix for loading cbc, after line properly
    // canvas.__eventListeners = {};
    const canvas = fabricRef.current!;

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
    });
}

// Convert Line to Cubic Beizer
function onObjectMouseUp(e: fabric.IEvent<MouseEvent>, canvas: fabric.Canvas) {
    // When endpoint released
    if (e.target == null) {
        console.log("onObjectMouseUp null target");
        return;
    }
    updateLineToCurve(e, e.target!.commonID!, canvas);
}

function updateLineToCurve(
    e: fabric.IEvent<MouseEvent>,
    commonID: string,
    canvas: fabric.Canvas
) {
    const [line, p1, p2] = getReqObjByNamesForID(canvas, commonID, [
        "frame_line",
        "p1",
        "p2",
    ]);

    if (line) {
        if (e.target!.name == "p3" && (p1 == null || p2 == null)) {
            // add p1, p2 controls points, make it a beizer curve
            const path = line!.path! as fabric.Path["path"];
            const startPoint: [number, number] = [path[0][1], path[0][2]];
            //TODO: How did p15, p16 work earlier ?
            const endPoint: [number, number] = [path[1][1], path[1][2]];
            const [controlPoint1, controlPoint2] = findEquidistantPoints(
                startPoint,
                endPoint
            );
            // console.log("UpdateLineToCurveInside", endPoint);

            // TODO: Edit path, from the endpoint/ control point itself

            line.path[1] = [
                "C",
                controlPoint1[0],
                controlPoint1[1],
                controlPoint2[0],
                controlPoint2[1],
                endPoint[0],
                endPoint[1],
            ];
            const initialFrame = line.initialFrame;

            const [p1, p2] = makeControlsPoints(controlPoint1, controlPoint2);
            linkControlPointsToLine(line as fabric.Path, p1, p2);
            setObjsOptions([e.target!, p1, p2], {
                currentType: "curve",
                initialFrame: initialFrame,
                commonID: commonID,
            });
            [p1, p2].map((o) => canvas.add(o));
            // canvas.add(p1);
            // canvas.add(p2);
            canvas.renderAll.bind(canvas);
        }
    }
}

// Convert Cubic Beizer to Line
function onObjectMouseDown(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
    if (e.target == null) {
        // console.log("onObjectMouseDown null target");
        return;
    }
    // console.log("mousedown", e);
    if (e.target!.name == "p3" && e.target!.currentType == "curve") {
        updateCurveToLine(e, e.target!.commonID, canvas);
    }
}

function updateCurveToLine(
    e: fabric.IEvent<MouseEvent>,
    commonID: string,
    canvas: fabric.Canvas
) {
    // remove p1, p2 controls points, make it a line
    console.log("UpdateCurveToLine");

    const [line, p1, p2] = getReqObjByNamesForID(canvas, commonID, [
        "frame_line",
        "p1",
        "p2",
    ]);

    if (line) {
        const path = line!.path! as fabric.Path["path"];
        const endPoint = [path[1][5], path[1][6]];
        canvas.remove(p1, p2);
        line.path[1] = ["L", endPoint[0], endPoint[1]];
        setObjsOptions([e.target!], {
            currentType: "line",
        });
        canvas.renderAll.bind(canvas);
    }
}

function onObjectMoving(e: fabric.IEvent<MouseEvent>, canvas?: fabric.Canvas) {
    if (e.target == null) {
        console.log("onObjectMoving null target");
        return;
    }
    // const [store] = getReqObjByNames(canvas, ["invisibleStore"]);
    // const currentFrame = store!.currentFrame;
    const currentFrame = currentFrameS.get();

    const initialFrame = e.target!.initialFrame;
    const currentType = e.target!.currentType;
    const commonID = e.target!.commonID;
    console.log(
        "Current frame is",
        currentFrame,
        initialFrame,
        currentType,
        commonID
    );

    if (initialFrame == currentFrame) {
        currentType == "point";
        // console.log(e.target.left, e.target.top);
        // console.log("Current type is point");
        // TODO: If next frame exist, update the next frame's start point accordingly
    } else {
        // Line or Curve
        if (currentType == "line") {
            onObjectMovingForLine(e, endPointOffset);
        } else if (currentType == "curve") {
            onObjectMovingForCurve(e, controlPointOffset, endPointOffset);
        } else {
            console.log("Can't decide between line and curve");
        }
    }
}

function onObjectMovingForLine(
    e: fabric.IEvent<MouseEvent>,
    endPointOffset: number
) {
    if (e.target!.name === "p0" || e.target!.name === "p3") {
        const p = e.target!;
        if (p.line1) {
            p.line1.path[0][1] = p.left! + endPointOffset;
            p.line1.path[0][2] = p.top! + endPointOffset;
        } else if (p.line4) {
            p.line4.path[1][1] = p.left! + endPointOffset;
            p.line4.path[1][2] = p.top! + endPointOffset;
        }
    }
}

function onObjectMovingForCurve(
    e: fabric.IEvent<MouseEvent>,
    controlPointOffset: number,
    endPointOffset: number
) {
    if (e.target!.name === "p0" || e.target!.name === "p3") {
        const p = e.target!;
        if (p.line1) {
            p.line1.path[0][1] = p.left! + endPointOffset;
            p.line1.path[0][2] = p.top! + endPointOffset;
        } else if (p.line4) {
            p.line4.path[1][5] = p.left! + endPointOffset;
            p.line4.path[1][6] = p.top! + endPointOffset;
        }
    } else if (e.target!.name === "p1") {
        const p = e.target;
        if (p.line2) {
            p.line2.path[1][1] = p.left! + controlPointOffset;
            p.line2.path[1][2] = p.top! + controlPointOffset;
        }
    } else if (e.target!.name === "p2") {
        const p = e.target;
        if (p.line3) {
            p.line3.path[1][3] = p.left! + controlPointOffset;
            p.line3.path[1][4] = p.top! + controlPointOffset;
        }
    }
}

export function onObjectSelected(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
    const activeObject = e.target!;
    if (activeObject.name === "p0" || activeObject.name === "p3") {
        activeObject.line2!.animate("opacity", "1", {
            duration: 200,
            onChange: canvas.renderAll.bind(canvas),
        });
        activeObject.line2!.selectable = true;
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
