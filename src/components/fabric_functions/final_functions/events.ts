import { fabric } from "fabric";
import { fabricRefType } from "../../Canvas";
import { contextMenuS, currentFrameS, framesS } from "../../react-ridge";
import {
    getReqObjByNamesForID,
    findEquidistantPoints,
    setObjsOptions,
} from "../helpers";
import { endPointOffset, controlPointOffset, extraProps } from "./constants";
import { linkControlPointsToLine } from "./linkage";
import { makeControlsPoints } from "./makeUpdateObjects";
import { v4 as uuidv4 } from "uuid";

export function bindFOEvents(fabricRef: fabricRefType) {
    // TODO: remove this workaround
    // fix for loading cbc, after line properly
    // canvas.__eventListeners = {};
    const canvas = fabricRef.current!;

    // @ts-expect-error hhh
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
            onObjectModified(e, canvas),
        drop: (e: fabric.IEvent<MouseEvent>) => onDrop(e, canvas),
        "selection:updated": (e: fabric.IEvent<MouseEvent>) =>
            onSelectionUpdated(e, canvas),
        "selection:created": (e: fabric.IEvent<MouseEvent>) =>
            onSelectionCreated(e, canvas),
        // drop: (e: fabric.IEvent<MouseEvent>) => onDrop(e, canvas),
    });
}

function onSelectionUpdated(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
    console.log(e);
}

function onSelectionCreated(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
    console.log(e);
}

function onDrop(e: fabric.IEvent<MouseEvent>, canvas: fabric.Canvas) {
    // Read data from DragEvent
    const getImageElementId = e.e.dataTransfer.getData("id");
    const offsetX = e.e.dataTransfer.getData("offsetX");
    const offsetY = e.e.dataTransfer.getData("offsetY");

    const imgE = document.getElementById(getImageElementId) as HTMLImageElement;

    const imgObj = new fabric.Image(imgE, {});

    const newCommonID: string = uuidv4();
    const groupObj = new fabric.Group([imgObj], {
        left: e.e.layerX - offsetX, // Fix mouse offset
        top: e.e.layerY - offsetY,
        dirty: true,
        commonID: newCommonID,
        hasBorders: false,
        hasControls: false,
    });

    const textObj = new fabric.IText("hi", {
        fontFamily: "Helvetica",
        fill: "#fff",
        originX: "center",
        textAlign: "center",
        fontSize: 18,
        top: -40,
        name: "textName",
    });

    const textObj2 = new fabric.IText("", {
        fontFamily: "Helvetica",
        fill: "#fff",
        originX: "center",
        textAlign: "center",
        fontSize: 9,
        top: -50,
        name: "textTag",
    });

    imgObj.scaleToWidth(imgE.width); //scaling the image height and width with target height and width, scaleToWidth, scaleToHeight fabric inbuilt function.
    imgObj.scaleToHeight(imgE.height);

    groupObj.add(textObj);
    groupObj.add(textObj2);

    canvas.add(groupObj);
    canvas.renderAll();
}

export const updateFramesData = (canvas: fabric.Canvas) => {
    // current frame data
    const currentFrameData = canvas.toJSON(extraProps);

    const currentFrame = currentFrameS.get();
    const frames = framesS.get();
    // console.log(currentFrame, frames);

    if (currentFrame < frames.length) {
        // console.log("Updating frames....");
        // Update
        framesS.set((prev) =>
            prev.map((item) =>
                prev.indexOf(item) == currentFrame ? currentFrameData : item
            )
        );
    } else if (currentFrame == frames.length) {
        // append
        console.log("Adding new frame....");
        framesS.set((prev) => [...prev, currentFrameData]);
    } else {
        console.log("Adding frame error....");

        console.warn("Error: currentFrame out of range of frames");
    }
};

function onObjectModified(e: fabric.IEvent<MouseEvent>, canvas: fabric.Canvas) {
    updateFramesData(canvas);
}

// Convert Line to Cubic Beizer
function onObjectMouseUp(e: fabric.IEvent<MouseEvent>, canvas: fabric.Canvas) {
    if (e.button == 3 && e.target) {
        console.log("Right clicked");
        contextMenuS.set({
            left: e.target!.left!,
            top: e.target!.top!,
            commonID: e.target.commonID!,
        });
        // canvas.remove(e.target);
    }
    // When endpoint released
    if (e.target == null) {
        console.log("onObjectMouseUp null target");
        return;
    }
    updateLineToCurve(e, e.target!.commonID!, canvas);
    updateFramesData(canvas); //Save to frames
}

function updateLineToCurve(
    e: fabric.IEvent<MouseEvent>,
    commonID: string,
    canvas: fabric.Canvas
) {
    const [lineO, p1, p2] = getReqObjByNamesForID(canvas, commonID, [
        "frame_line",
        "p1",
        "p2",
    ]);
    const line = lineO as fabric.Path;

    if (line) {
        if (e.target!.name == "p3" && (p1 == null || p2 == null)) {
            // add p1, p2 controls points, make it a beizer curve
            const path = line!.path;
            const startPoint: [number, number] = [path[0][1], path[0][2]] as [
                number,
                number
            ];
            //TODO: How did p15, p16 work earlier ?
            const endPoint: [number, number] = [path[1][1], path[1][2]] as [
                number,
                number
            ];
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
        updateCurveToLine(e, e.target!.commonID!, canvas);
    }
}

function updateCurveToLine(
    e: fabric.IEvent<MouseEvent>,
    commonID: string,
    canvas: fabric.Canvas
) {
    // remove p1, p2 controls points, make it a line
    console.log("UpdateCurveToLine");

    const [lineO, p1, p2] = getReqObjByNamesForID(canvas, commonID, [
        "frame_line",
        "p1",
        "p2",
    ]);

    const line = lineO as fabric.Path;

    if (line) {
        const path = line!.path!;
        const endPoint = [path[1][5], path[1][6]];
        canvas.remove(p1!, p2!);
        line.path[1] = ["L", endPoint[0], endPoint[1]];
        setObjsOptions([e.target!], {
            currentType: "line",
        });
        canvas.renderAll.bind(canvas);
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // const commonID = e.target!.commonID;
    // console.log(
    //     "Current frame is",
    //     currentFrame,
    //     initialFrame,
    //     currentType,
    //     commonID
    // );

    if (initialFrame == currentFrame) {
        // Should move normally
        // currentType == "point";
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
        const p = e.target!;
        if (p.line2) {
            p.line2.path[1][1] = p.left! + controlPointOffset;
            p.line2.path[1][2] = p.top! + controlPointOffset;
        }
    } else if (e.target!.name === "p2") {
        const p = e.target!;
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
    console.log(activeObject);
}

export function onSelectionCleared(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    e: fabric.IEvent<MouseEvent>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
