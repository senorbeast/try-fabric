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
    makeEndPoints,
    updatePointToLine,
} from "./final_functions/makeUpdateObjects";
import { unMovableOptions } from "./final_functions/constants";
import { currentFrameS, fOIdsState } from "../react-ridge";

export const frameObject = (
    fabricRef: fabricRefType,
    startPoint: [number, number],
    endPoint: [number, number],
    name: string,
    newObject: boolean,
    oldOptions: fabric.IObjectOptions
) => {
    const canvas = fabricRef.current!;
    const currentFrame = currentFrameS.get();

    const [p0, p3] = makeEndPoints(startPoint, endPoint);
    p0.set({ opacity: 0.5, ...unMovableOptions });
    p3.set({ hasBorders: false, hasControls: false });
    console.log(name);

    // Make only a point, when its a new object
    if (newObject) {
        const newCommonID: string = uuidv4();
        setObjsOptions([p0, p3], {
            initialFrame: currentFrame,
            currentType: "point",
            commonID: newCommonID,
        });
        // store?.set({ fOIds: [...store["fOIds"]!, newCommonID] });
        fOIdsState.set((prev) => [...prev, newCommonID]);
        // console.log("new object", currentFrame);
        // Create line-curve for subsequent newFrames
        // @ts-expect-error only point not does work somehow
    } else if (p3.currentType != "line" || p3.currentType != "curve") {
        const initialFrame = p3["initialFrame"];
        console.log("should make line", currentFrame, initialFrame);
        // if (currentFrame > 0) {
        updatePointToLine(fabricRef, p0, p3, oldOptions);
        // }
    }
    canvas.add(p3);
    canvas.renderAll();
};

export function newObjectForNewFrame(fabricRef: fabricRefType) {
    const canvas = fabricRef.current!;

    // const [store] = getReqObjByNames(canvas, ["invisibleStore"]);
    // const fOIds = store!.fOIds as string[];
    const fOIds = fOIdsState.get();
    // TODO: Optimise by filtering objects with id, in one pass: objects[][]
    fOIds.forEach((fOId) => {
        rmOldObjAddNewObj(fabricRef, fOId);
    });
}

function rmOldObjAddNewObj(
    fabricRef: fabricRefType,
    commonID: string,
    objects?: fabric.Object[]
) {
    const canvas = fabricRef.current!;
    const [line, p0, p1, p2, p3] = getReqObjByNamesForID(
        canvas,
        commonID,
        ["frame_line", "p0", "p1", "p2", "p3"],
        objects
    );

    console.log("p3", p3);

    const endPoint: [number, number] = [p3!.left!, p3!.top!];

    const oldOptions: fabric.IObjectOptions = {
        initialFrame: p3!.initialFrame,
        commonID: p3!.commonID,
    };

    // console.log("In newObjectForNewFrame", oldOptions);
    canvas.remove(line!, p0!, p1!, p2!, p3!);
    //TODO: need to load old objects attribute in new frame
    // if (p3.currentType == "point") {
    // } else if (p3.currentType == "line" || p3.currentType == "curve") {
    // }
    frameObject(fabricRef, endPoint, endPoint, "frame_line", false, oldOptions);
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
        console.log("Line found!", line1.commonID);
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
