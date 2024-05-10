import type { fabricRefType } from "../Canvas";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

import {
    getReqObjByNames,
    getReqObjByNamesForID,
    setObjsOptions,
} from "./helpers";
import {
    linkEndPointsToLine,
    linkPointsToLine,
} from "./final_functions/linkage";
import {
    makeCustomEndPoint,
    updateLinePath,
    updatePointToLine,
} from "./final_functions/makeUpdateObjects";
import { endPointOffset } from "./final_functions/constants";
import { currentFrameS, fOIdsState } from "../react-ridge";

export const frameObject = (
    fabricRef: fabricRefType,
    startPoint: [number, number]
) => {
    const canvas = fabricRef.current!;

    const p3 = makeCustomEndPoint(
        startPoint[0] + endPointOffset,
        startPoint[1] + endPointOffset
    );
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
    const canvas = fabricRef.current!;
    const [line, p0, p3] = getReqObjByNames(canvas, ["frame_line", "p0", "p3"]);
    linkEndPointsToLine(line as fabric.Path, p0!, p3!);
}

export function runAfterJSONLoad2(
    fabricRef: fabricRefType
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // lineName: string,
    // replace?: boolean
) {
    // This is required all canvas JSON is loaded,
    // these objects/functionality is not stored in the json
    // const canvas = fabricRef.current!;

    // const [store] = getReqObjByNames(canvas, ["invisibleStore"]);
    // const fOIds = store!.fOIds as string[];
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
    const [line1, p0, p1, p2, p3] = getReqObjByNamesForID(
        canvas,
        commonID,
        ["frame_line", "p0", "p1", "p2", "p3"],
        objects
    );

    // console.log("Linking existing points");
    if (line1) {
        // console.log("Line found!", line1.commonID);
        const line = line1 as fabric.Path;
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
