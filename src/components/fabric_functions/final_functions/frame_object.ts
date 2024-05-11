import type { fabricRefType } from "../../Canvas";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

import { getReqObjByNamesForID, setObjsOptions } from "../helpers";
import { linkPointsToLine } from "./linkage";
import {
    makeCustomEndPoint,
    updateLinePath,
    updatePointToLine,
} from "./makeUpdateObjects";
import { endPointOffset } from "./constants";
import { currentFrameS, fOIdsState } from "../../react-ridge";

export const frameObject = (
    fabricRef: fabricRefType,
    startPoint: [number, number]
) => {
    const canvas = fabricRef.current!;

    const p3 = makeCustomEndPoint(startPoint[0], startPoint[1]);
    p3.name = "p3";
    p3.set({ hasBorders: false, hasControls: false });

    const newCommonID: string = uuidv4();
    const currentFrame = currentFrameS.get();
    setObjsOptions([p3], {
        initialFrame: currentFrame,
        currentType: "point",
        commonID: newCommonID,
    });
    fOIdsState.set((prev) => [...prev, newCommonID]);

    canvas.add(p3);
    canvas.renderAll();
};

// Called on for new Frame
export function updateObjsForNewFrame(fabricRef: fabricRefType) {
    const fOIds = fOIdsState.get();
    // TODO: Optimise by filtering objects with id, in one pass: objects[][]
    fOIds.forEach((fOId) => {
        updateObjForNewFrame(fabricRef, fOId);
    });
}

function updateObjForNewFrame(
    fabricRef: fabricRefType,
    commonID: string,
    objects?: fabric.Object[]
) {
    const canvas = fabricRef.current!;
    const [p3] = getReqObjByNamesForID(canvas, commonID, ["p3"], objects);

    const oldOptions: fabric.IObjectOptions = {
        initialFrame: p3!.initialFrame,
        commonID: p3!.commonID,
    };

    // Create line-curve for subsequent newFrame
    if (p3!.initialFrame! < currentFrameS.get() && p3!.currentType == "point") {
        // Upgrade obj to line
        updatePointToLine(fabricRef, p3!, oldOptions);
    } else {
        // Move coinciding line to that pointPosition
        const [line, p0, p1, p2] = getReqObjByNamesForID(
            canvas,
            commonID,
            ["frame_line", "p0", "p1", "p2"],
            objects
        );
        canvas.remove(p1!, p2!); //remove controlPoints, from canvas (but its reference is used next)
        // move initial point to endpoint + update path

        p0!.left = p3!.left!;
        p0!.top = p3!.top!;
        // Offset to center
        const pointPos = [
            p3!.left! + endPointOffset,
            p3!.top! + endPointOffset,
        ] as [number, number];
        updateLinePath(pointPos, pointPos, line as fabric.Path);
        linkPointsToLine(line as fabric.Path, p0!, p1!, p2!, p3!);
        canvas.renderAll();
    }
}

export function runAfterJSONLoad(fabricRef: fabricRefType) {
    const fOIds = fOIdsState.get();
    fOIds.forEach((fOId) => {
        findAndLinkOneGroup(fabricRef, fOId);
    });
}

const findAndLinkOneGroup = (
    fabricRef: fabricRefType,
    commonID: string,
    objects?: fabric.Object[]
) => {
    // const { line, points } = getReqObj(canvas);
    const canvas = fabricRef.current!;
    const [lineO, p0, p1, p2, p3] = getReqObjByNamesForID(
        canvas,
        commonID,
        ["frame_line", "p0", "p1", "p2", "p3"],
        objects
    );

    // console.log("Linking existing points");
    if (lineO) {
        // console.log("Line found!", line1.commonID);
        const line = lineO as fabric.Path;
        // To fix position of line after loading
        line!.height = 0;
        line!.width = 0;
        line.pathOffset.x = line.left!;
        line.pathOffset.y = line.top!;

        // Link existing points
        // const [p0, p1, p2, p3] = points;
        linkPointsToLine(line, p0!, p1!, p2!, p3!);
    }

    // bindCubicEvents(canvas);
    canvas.renderAll();
};

// TODO: Next onMouseDragOver, convert the line into a cubic beizer curve
// update line name, line path
// will require default control points
// add control points icons
// link them with line
// add proper event handlers

// # PRIORITY Add ids with uuid + prepend text like line, p0... for runAfterloaders

//# Frame stuff
// for next frame load, line into previous frames' endPoint
