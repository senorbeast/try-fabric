import type { fabricRefType } from "../../../../Canvas";
import { v4 as uuidv4 } from "uuid";
import { updateFramesWithFO } from "./updateFramesWithFO";
import { makeCustomEndPoint } from "../helpers/makeUpdateObjects";
import { currentFrameS, fOIdsState, framesS } from "../../react-ridge";
import { setObjsOptions } from "../helpers/getterSetters";

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

    // Update frameState, when fO is added to a non-last frame
    const frames = framesS.get();
    if (currentFrame < frames.length - 1) {
        updateFramesWithFO(p3);
    }

    canvas.add(p3);
    canvas.renderAll();
};
