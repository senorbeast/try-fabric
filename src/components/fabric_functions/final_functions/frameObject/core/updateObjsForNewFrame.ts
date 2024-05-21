import { fabricRefType } from "../../../../Canvas";
import { currentFrameS, fOIdsState } from "../../react-ridge";
import { getReqObjByNamesForID } from "../helpers/getterSetters";
import {
    updatePointToLine,
    updateLineToCoincidingLine,
} from "../helpers/makeUpdateObjects";

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
        // Upgrade p3 point to line
        updatePointToLine(fabricRef, p3!, oldOptions);
    } else {
        updateLineToCoincidingLine(p3!, commonID, canvas, objects);
    }
}
