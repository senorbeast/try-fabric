import { endPointOffset, controlPointOffset } from "../constants";
import { canvasJSONType } from "../helper.types";
import { currentFrameS, framesS } from "../react-ridge";

export function onObjectMoving(
    e: fabric.IEvent<MouseEvent>,
    canvas?: fabric.Canvas
) {
    if (e.target == null) {
        console.log("onObjectMoving null target", canvas);
        return;
    }
    const currentFrame = currentFrameS.get();
    const frames = framesS.get();
    const framesLength = frames.length;

    const initialFrame = e.target!.initialFrame;
    const currentType = e.target!.currentType;

    // Update p0 and line in next frame, when p3 changes
    // Works for all p3 (point or a line)
    if (e.target!.name === "p3" && currentFrame < framesLength - 1) {
        // update the next frame state
        updateStartPointAndLinePathForNextFrame(e, canvas!, currentFrame);
    }

    if (initialFrame == currentFrame) {
        //  Should move normally since fabricObject is a point
    } else {
        // Line or Curve Object moving
        if (currentType == "line") {
            onObjectMovingForLine(e, endPointOffset);
        } else if (currentType == "curve") {
            onObjectMovingForCurve(e, controlPointOffset, endPointOffset);
        } else {
            console.log("Can't decide between line and curve");
        }
    }
}

//  Causing lag, unused now
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// function updateAllNextFramesFO(pointObj: fabric.Object, currentFrame: number) {
//     // update p3,p0, line in all next frames, where its not already edited
//     framesS.set((frames: canvasJSONType[]) => {
//         // frames.map((frame, idx) => {
//         // if (idx > currentFrame) {
//         // Find fO objs

//         const frame = frames[currentFrame + 1];
//         // updateCoincidingFOforFrame(frame, pointObj);
//         //     }
//         // });
//         return frames;
//     });
// }

// function updateCoincidingFOforFrame(
//     frame: canvasJSONType,
//     pointObj: fabric.Object
// ) {
//     const frameObjectCollection = frame.objects.filter(
//         (obj) => obj.commonID == pointObj.commonID
//     );
//     if (frameObjectCollection[0].currentType == "curve") {
//         return;
//     }

//     // Update line, p0, p3 for non-edited fO, i.e. lines
//     const p0: fabric.Object = frameObjectCollection.filter(
//         (obj) => (obj.name = "p0")
//     )[0];
//     const line: fabric.Path = frameObjectCollection.filter(
//         (obj) => (obj.name = "frame_line")
//     )[0] as fabric.Path;
//     const p3 = frameObjectCollection.filter((obj) => (obj.name = "p3"))[0];

//     p0.left = pointObj.left;
//     p0.top = pointObj.top;
//     p3.left = pointObj.left;
//     p3.top = pointObj.top;
//     line.path[0][1] = pointObj.left! + endPointOffset;
//     line.path[0][2] = pointObj.top! + endPointOffset;
//     line.path[1][1] = pointObj.left! + endPointOffset;
//     line.path[1][2] = pointObj.top! + endPointOffset;
// }

function updateStartPointAndLinePathForNextFrame(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas,
    currentFrame: number
) {
    // console.log("before", frames[currentFrame + 1]);
    const commonID = e.target!.commonID!;

    framesS.set((frames: canvasJSONType[]) => {
        const nextFrame = frames[currentFrame + 1];

        // Find p0 of same frameObject collection in nextFrame
        const frameObjectP0 = nextFrame.objects.filter(
            (obj) => obj.commonID == commonID && obj.name == "p0"
        );

        const frameObjectLine = nextFrame.objects.filter(
            (obj) => obj.commonID == commonID && obj.name == "frame_line"
        );
        // Update position of p0 and its corresponding path
        const p0 = frameObjectP0[0]; //next frame p0
        const p3 = e.target!; // current frame p3
        const line = frameObjectLine[0] as fabric.Path;
        // console.log(p0, frameObjectLine);

        // TODO: properly update all the next frame,
        // its line, p0, and everything that is required to be updated
        // console.log(p0);
        if (p0.line1) {
            p0.line1.path[0][1] = p3.left! + endPointOffset;
            p0.line1.path[0][2] = p3.top! + endPointOffset;
            p0.line1.left = p3.left;
            p0.line1.top = p3.top;
            // console.log("Editing line");
            // console.log(p0.line1);
        }
        p0.left = p3.left;
        p0.top = p3.top;

        line.left = p3.left;
        line.top = p3.top;
        line.path[0][1] = p3.left! + endPointOffset;
        line.path[0][2] = p3.top! + endPointOffset;

        return frames;
    });
    // console.log("after", frames[currentFrame + 1]);
    canvas.renderAll();
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
