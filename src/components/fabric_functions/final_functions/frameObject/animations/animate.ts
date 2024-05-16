import { fabricRefType } from "../../../../Canvas";

import { endPointOffset } from "../../constants";
import { canvasJSONType, PathType } from "../../helper.types";
import {
    currentFrameS,
    animationDurationS,
    animationRelativeProgressS,
    animationFrameS,
    animationPauseS,
    rafID,
} from "../../react-ridge";
import { interpolatePath } from "../helpers/interpolate";
import { imageObject } from "../helpers/makeUpdateObjects";

export function newAnimation(
    fabricRef: fabricRefType,
    frames: canvasJSONType[]
) {
    const canvas: fabric.Canvas = fabricRef.current!;
    currentFrameS.set(-1); // [IMP] so, (updateFrameData doesn't update frames) via onObjectsModified during animations

    // remove all objects from canvas
    const removableObjs = canvas.getObjects();
    // .filter((obj) => obj.);

    canvas.remove(...removableObjs);

    // commonID, [path, animateObject]
    type foPath = Record<string, PathType>;
    //frameNo, foPath
    const fOInFrames: Record<number, foPath> = {};

    const addedAnimateObjects: Record<string, fabric.Object> = {};

    // for each FO i will require allPaths
    // Fill in paths across frames
    frames.forEach((frame, frameIdx) => {
        if (frame !== undefined) {
            frame.objects.forEach((objO) => {
                if (objO.name == "frame_line") {
                    const obj = objO as fabric.Path;
                    // New Frame
                    if (!fOInFrames[frameIdx]) {
                        fOInFrames[frameIdx] = {};
                    }

                    // Create single animate object
                    if (
                        !Object.keys(addedAnimateObjects).includes(
                            obj.commonID!
                        )
                    ) {
                        // New animateObject
                        const animateObject = imageObject("my-image");
                        animateObject.set({ name: "animateObject" });
                        addedAnimateObjects[obj.commonID!] = animateObject;
                    }
                    fOInFrames[frameIdx][obj.commonID!] = obj.path;
                }
            });
        }
    });
    canvas.renderAll();

    // console.log(fOInFrames);

    const duration = animationDurationS.get() ?? 1500; // animation duration for each frame in ms

    let startTime: number | null = null;
    // let pausedTime: number | null = null;

    const renderedAnimateObjects: string[] = [];

    const animate = (timestamp: number) => {
        if (!startTime) {
            startTime = timestamp;
        }
        // const runtime = animationPauseS.get()
        //     ? pausedTime! - startTime!
        //     : timestamp - startTime;

        const runtime = timestamp - startTime;
        // console.log(
        //     "Animation Progress",
        //     animationFrameS.get() + animationRelativeProgressS.get()
        // );
        // console.log(startTime, timestamp, performance.now());
        animationRelativeProgressS.set(runtime / duration);

        // Get objects in currentFrame and update the position
        Object.entries(fOInFrames[animationFrameS.get()]).forEach(
            ([commonID, frameObjectPath]) => {
                if (!renderedAnimateObjects.includes(commonID)) {
                    renderedAnimateObjects.push(commonID);
                    canvas.add(addedAnimateObjects[commonID]);
                }
                const [x, y] = interpolatePath(
                    frameObjectPath,
                    animationRelativeProgressS.get()
                );
                // Set position
                addedAnimateObjects[commonID].set({
                    left: x - endPointOffset,
                    top: y - endPointOffset,
                });
            }
        );
        canvas.renderAll();

        if (animationPauseS.get() == true) {
            cancelAnimationFrame(rafID.get());
            return;
        } else if (
            runtime < duration &&
            animationFrameS.get() < frames.length
        ) {
            // More animation to be done in current frame
        } else if (animationFrameS.get() < frames.length - 1) {
            // moving to the next frame
            animationFrameS.set((prev: number) => prev + 1);
            startTime = timestamp;
            animationRelativeProgressS.set(0);
        } else {
            // onFullAnimationComplete
            animationFrameS.set(1);
            currentFrameS.set(1);
            animationPauseS.set(true);
            animationRelativeProgressS.set(0);
            console.log("Full animation complete");
        }
        requestAnimationFrame(animate);
    };

    const raFID = requestAnimationFrame(animate);
    rafID.set(raFID);
}
