import { newRidgeState } from "react-ridge-state";

// Init state
export const animationPauseS = newRidgeState<boolean>(true);
export const animationDurationS = newRidgeState<number>(1500);
export const currentFrameS = newRidgeState<number>(2);
export const animationFrameS = newRidgeState<number>(2);
export const animationRelativeProgressS = newRidgeState<number>(0);
export const fOIdsState = newRidgeState<string[]>([]);
// export const prevStartTime;
