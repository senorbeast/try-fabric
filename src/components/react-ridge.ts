import { newRidgeState } from "react-ridge-state";
import { canvasJSONType } from "./ButtonPanel";

// Init state
export const animationPauseS = newRidgeState<boolean>(true);
export const animationDurationS = newRidgeState<number>(1500);
export const animationFrameS = newRidgeState<number>(1);
export const animationRelativeProgressS = newRidgeState<number>(0);

export const currentFrameS = newRidgeState<number>(0);

// not used currently (Using fOIds of invisible store)
// need to update the savedJSON to use this foIDs
export const fOIdsState = newRidgeState<string[]>([]);

export const framesS = newRidgeState<canvasJSONType[]>([
    {
        version: "5.3.0",
        objects: [],
    },
]);
export const prevStartTime = newRidgeState<number>(0);
