import { updateFramesData } from "../frameObject/core/updateFramesData";
import {
    getReqObjByNamesForID,
    setObjsOptions,
} from "../frameObject/helpers/getterSetters";
import { linkControlPointsToLine } from "../frameObject/helpers/linkage";
import { makeControlsPoints } from "../frameObject/helpers/makeUpdateObjects";
import { findEquidistantPoints } from "../frameObject/helpers/mapEquidistantPoints";
import { contextMenuS } from "../react-ridge";

// Convert Line to Cubic Beizer
export function onObjectMouseUp(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
    if (e.button == 3 && e.target) {
        console.log("Right clicked");
        contextMenuS.set({
            left: e.target!.left!,
            top: e.target!.top!,
            commonID: e.target.commonID!,
        });
        // canvas.remove(e.target);
    }
    // When endpoint released
    if (e.target == null) {
        console.log("onObjectMouseUp null target");
        return;
    }
    updateLineToCurve(e, e.target!.commonID!, canvas);
    updateFramesData(canvas); //Save to frames
}

function updateLineToCurve(
    e: fabric.IEvent<MouseEvent>,
    commonID: string,
    canvas: fabric.Canvas
) {
    const [lineO, p1, p2] = getReqObjByNamesForID(canvas, commonID, [
        "frame_line",
        "p1",
        "p2",
    ]);
    const line = lineO as fabric.Path;

    if (line) {
        if (e.target!.name == "p3" && (p1 == null || p2 == null)) {
            // add p1, p2 controls points, make it a beizer curve
            const path = line!.path;
            const startPoint: [number, number] = [path[0][1], path[0][2]] as [
                number,
                number
            ];
            //TODO: How did p15, p16 work earlier ?
            const endPoint: [number, number] = [path[1][1], path[1][2]] as [
                number,
                number
            ];
            const [controlPoint1, controlPoint2] = findEquidistantPoints(
                startPoint,
                endPoint
            );
            // console.log("UpdateLineToCurveInside", endPoint);

            // TODO: Edit path, from the endpoint/ control point itself

            line.path[1] = [
                "C",
                controlPoint1[0],
                controlPoint1[1],
                controlPoint2[0],
                controlPoint2[1],
                endPoint[0],
                endPoint[1],
            ];
            const initialFrame = line.initialFrame;

            const [p1, p2] = makeControlsPoints(controlPoint1, controlPoint2);
            linkControlPointsToLine(line as fabric.Path, p1, p2);
            setObjsOptions([e.target!, p1, p2], {
                currentType: "curve",
                initialFrame: initialFrame,
                commonID: commonID,
            });
            [p1, p2].map((o) => canvas.add(o));
            // canvas.add(p1);
            // canvas.add(p2);
            canvas.renderAll.bind(canvas);
        }
    }
}
