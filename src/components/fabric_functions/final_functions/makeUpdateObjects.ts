import { fabricRefType } from "../../Canvas";
import { imageObject } from "../common";
import { setObjsOptions } from "../helpers";
import { endPointOffset, unMovableOptions } from "./constants";
import { linkEndPointsToLine } from "./linkage";

export { updatePointToLine, makeEndPoints, makeControlsPoints };

function updatePointToLine(
    fabricRef: fabricRefType,
    p0: fabric.Object,
    p3: fabric.Object,
    oldOptions: fabric.IObjectOptions
) {
    const canvas = fabricRef.current!;
    const startPoint = [
        p0.left! + endPointOffset,
        p0.top! + endPointOffset,
    ] as [number, number];
    const endPoint = [p3.left! + endPointOffset, p3.top! + endPointOffset] as [
        number,
        number
    ];

    // TODO: set the path of the line

    const line = makeLinePath(startPoint, endPoint, "frame_line");
    linkEndPointsToLine(line, p0, p3);
    // console.log("objs, updatePointToLine", line, p0, p3);
    setObjsOptions([line, p0, p3], { currentType: "line", ...oldOptions });
    [line, p0].map((o) => canvas.add(o));
    // canvas.add(line);
    // canvas.add(p0);
    canvas.renderAll();
}

function makeLinePath(
    startPoint: [number, number],
    endPoint: [number, number],
    name: string
): fabric.Path {
    const line = new fabric.Path(
        `M ${startPoint[0]} ${startPoint[1]} L ${endPoint[0]} ${endPoint[1]}`,
        {
            fill: "",
            stroke: "black",
            objectCaching: false,
            strokeUniform: true,
            strokeDashArray: [5, 5],
        }
    );

    line.path[0][1] = startPoint[0];
    line.path[0][2] = startPoint[1];
    line.path[1][1] = endPoint[0];
    line.path[1][2] = endPoint[1];

    line.set({
        name: name,
        ...unMovableOptions,
    });

    return line;
}

function makeEndPoints(
    startPoint: number[],
    endPoint: number[]
): fabric.Object[] {
    // Add start point
    const p0 = makeCustomEndPoint(startPoint[0], startPoint[1]);
    p0.name = "p0";

    // Add end point
    const p3 = makeCustomEndPoint(endPoint[0], endPoint[1]);
    p3.name = "p3";

    return [p0, p3];
}

function makeCustomEndPoint(left: number, top: number) {
    const c = imageObject("my-image");
    c.set({
        left: left,
        top: top,
    });
    return c;
}

function makeControlsPoints(
    controlPoint1: number[],
    controlPoint2: number[]
): fabric.Object[] {
    // Add 1st control point
    const p1 = makeControlPoint(controlPoint1[0], controlPoint1[1]);
    p1.name = "p1";

    // Add 2nd control point
    const p2 = makeControlPoint(controlPoint2[0], controlPoint2[1]);
    p2.name = "p2";

    return [p1, p2];
}

function makeControlPoint(left: number, top: number) {
    const c = new fabric.Circle({
        left: left - 8,
        top: top - 8,
        radius: 8,
        fill: "#fff",
    });

    return c;
}
