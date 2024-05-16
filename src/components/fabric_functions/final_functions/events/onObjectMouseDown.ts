import {
    getReqObjByNamesForID,
    setObjsOptions,
} from "../frameObject/helpers/getterSetters";

// Convert Cubic Beizer to Line
export function onObjectMouseDown(
    e: fabric.IEvent<MouseEvent>,
    canvas: fabric.Canvas
) {
    if (e.target == null) {
        // console.log("onObjectMouseDown null target");
        return;
    }
    // console.log("mousedown", e);
    if (e.target!.name == "p3" && e.target!.currentType == "curve") {
        updateCurveToLine(e, e.target!.commonID!, canvas);
    }
}

function updateCurveToLine(
    e: fabric.IEvent<MouseEvent>,
    commonID: string,
    canvas: fabric.Canvas
) {
    // remove p1, p2 controls points, make it a line
    console.log("UpdateCurveToLine");

    const [lineO, p1, p2] = getReqObjByNamesForID(canvas, commonID, [
        "frame_line",
        "p1",
        "p2",
    ]);

    const line = lineO as fabric.Path;

    if (line) {
        const path = line!.path!;
        const endPoint = [path[1][5], path[1][6]];
        canvas.remove(p1!, p2!);
        line.path[1] = ["L", endPoint[0], endPoint[1]];
        setObjsOptions([e.target!], {
            currentType: "line",
        });
        canvas.renderAll.bind(canvas);
    }
}
