import { newRidgeState } from "react-ridge-state";
import { canvasJSONType } from "./helper.types";

// Init state

// Animations
export const animationPauseS = newRidgeState<boolean>(true);
export const animationDurationS = newRidgeState<number>(1500);
export const animationFrameS = newRidgeState<number>(1);
export const animationRelativeProgressS = newRidgeState<number>(0);
export const rafID = newRidgeState<number>(0);

// export const prevStartTime = newRidgeState<number>(0); // to fix

// ---------------------------------------------------------------------

// General state for frames
export const currentFrameS = newRidgeState<number>(0);
export const fOIdsState = newRidgeState<string[]>([]); // keep track of Frame Object across frames
export const framesS = newRidgeState<canvasJSONType[]>([
    {
        version: "5.3.0",
        objects: [],
    },
]);

// ---------------------------------------------------------------------

// Modes
export type modeTypes = "freeRoam" | "frames";
export const modeS = newRidgeState<modeTypes>("freeRoam");
// ---------------------------------------------------------------------

export type contextMenuProps = {
    left: number;
    top: number;
    commonID: string;
};

export const contextMenuS = newRidgeState<contextMenuProps>({
    left: 0,
    top: 0,
    commonID: "",
});

// NOT USED
export const draggedElementIDS = newRidgeState<string>("");
