import { extraProps } from "../../constants";
import { canvasJSONType } from "../../helper.types";
import { currentFrameS, framesS } from "../../react-ridge";

export const updateFramesData = (canvas: fabric.Canvas) => {
    console.log("updateFramesData");
    const currentFrameData = canvas.toJSON(extraProps);
    const currentFrame = currentFrameS.get();
    const frames: canvasJSONType[] = framesS.get();

    if (currentFrame < frames.length) {
        // console.log("Updating frames....");
        // Update
        framesS.set((prev: canvasJSONType[]) =>
            prev.map((item) =>
                prev.indexOf(item) == currentFrame ? currentFrameData : item
            )
        );
    } else if (currentFrame == frames.length) {
        // append
        console.log("Adding new frame....");
        framesS.set((prev: canvasJSONType[]) => [...prev, currentFrameData]);
    } else {
        console.log("Adding frame error....");
        console.warn("Error: currentFrame out of range of frames");
    }
};
