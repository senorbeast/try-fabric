import { fabricRefType } from "../../../../Canvas";
import { endPointOffset } from "../../constants";
import { currentFrameS, fOIdsState } from "../../react-ridge";
import { getReqObjByNamesForID } from "../helpers/getterSetters";
import { linkLinetoPoints } from "../helpers/linkage";
import {
    updatePointToLine,
    updateLinePath,
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
        // Upgrade obj to line
        updatePointToLine(fabricRef, p3!, oldOptions);
    } else {
        // Move coinciding line to that pointPosition
        const [line, p0, p1, p2] = getReqObjByNamesForID(
            canvas,
            commonID,
            ["frame_line", "p0", "p1", "p2"],
            objects
        );
        canvas.remove(p1!, p2!); //remove controlPoints, from canvas (but its reference is used next)
        // move initial point to endpoint + update path

        p0!.left = p3!.left!;
        p0!.top = p3!.top!;
        // Offset to center
        const pointPos = [
            p3!.left! + endPointOffset,
            p3!.top! + endPointOffset,
        ] as [number, number];
        updateLinePath(pointPos, pointPos, line as fabric.Path);
        linkLinetoPoints(line as fabric.Path, p0!, p1!, p2!, p3!);
        canvas.renderAll();
    }
}
