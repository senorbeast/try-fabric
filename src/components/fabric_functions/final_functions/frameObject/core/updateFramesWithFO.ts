import { extraProps } from "../../constants";
import { makeLineP0FromP3 } from "../helpers/makeUpdateObjects";
import { currentFrameS, framesS } from "../../react-ridge";
import { canvasJSONType } from "../../helper.types";

export function updateFramesWithFO(p3: fabric.Object) {
    // While adding a new FO, and ifs its not the last frame,
    // add that FO, to all consecutives frames, with a coinciding line

    // Create coinciding FO from p3,

    // new Options
    const newOptions: fabric.IObjectOptions = {
        initialFrame: p3!.currentFrame,
        commonID: p3!.commonID,
    };

    const [line, p0] = makeLineP0FromP3(p3, newOptions);
    const lineJSON = line.toJSON(extraProps) as unknown as fabric.Object;
    const p0JSON = p0.toJSON(extraProps) as unknown as fabric.Object;
    const p3JSON = p3.toJSON(extraProps) as unknown as fabric.Object;

    // Add line, p0, p3 to all consecutive frameStates
    const currentFrame = currentFrameS.get();
    framesS.set((frames: canvasJSONType[]) => {
        frames.forEach((frame, idx) => {
            if (idx > currentFrame) {
                // Add line, p0, p3
                frame.objects.push(lineJSON);
                frame.objects.push(p0JSON);
                frame.objects.push(p3JSON);
            }
        });
        return frames;
    });

    // set p3 back to point in current frame
    p3.set({ currentType: "point" });
}
