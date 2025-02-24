import { fabric } from "fabric";
import { fabricRefType } from "../../../../Canvas";
import { endPointOffset, unMovableOptions } from "../../constants";
import { linkEndPointsToLine, linkLinetoPoints } from "./linkage";
import { getReqObjByNamesForID, setObjsOptions } from "./getterSetters";

// make
export {
    makeEndPoints,
    makeControlsPoints,
    makeCustomEndPoint,
    imageObject,
    makeLineP0FromP3,
};

// update or upgrade
export {
    updateLinePath,
    updatePointToCoincidingLine,
    updateLineToCoincidingLine,
};

// Update --------------------------------------------------------

// For new frames, or when condn is met
function updatePointToCoincidingLine(
    fabricRef: fabricRefType,
    p3: fabric.Object,
    oldOptions: fabric.IObjectOptions
) {
    const canvas = fabricRef.current!;
    const [line, p0] = makeLineP0FromP3(p3, oldOptions);

    [line, p0].map((o) => canvas.add(o));
    canvas.renderAll();
}

// Helps updateLineToCoincidingLine
function updateLinePath(
    startPoint: [number, number],
    endPoint: [number, number],
    line: fabric.Path
) {
    line.left = startPoint[0];
    line.top = startPoint[1];
    line.width = 0;
    line.height = 0;

    line.pathOffset.x = startPoint[0];
    line.pathOffset.y = startPoint[1];

    line.path[0][0] = "M";
    line.path[0][1] = startPoint[0];
    line.path[0][2] = startPoint[1];
    line.path[1][0] = "L";
    line.path[1][1] = endPoint[0];
    line.path[1][2] = endPoint[1];

    return line;
}

// For new frames, or when condn is met (when frameObject is already a line)
function updateLineToCoincidingLine(
    p3: fabric.Object,
    commonID: string,
    canvas: fabric.Canvas,
    objects?: fabric.Object[]
) {
    // If already a line ? Then:
    // Move coinciding line to that pointPosition
    const [line, p0, p1, p2] = getReqObjByNamesForID(
        canvas,
        commonID,
        ["frame_line", "p0", "p1", "p2"],
        objects
    );
    canvas.remove(p1!, p2!); //remove controlPoints, from canvas (but its reference is used next)
    // move initial point to endpoint + update path

    p0!.left = p3.left!;
    p0!.top = p3.top!;
    // Offset to center
    const pointPos = [
        p3!.left! + endPointOffset,
        p3!.top! + endPointOffset,
    ] as [number, number];
    updateLinePath(pointPos, pointPos, line as fabric.Path);
    linkLinetoPoints(line as fabric.Path, p0!, p1!, p2!, p3);
    canvas.renderAll();
}

// Make -------------------------------------------------------------

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

function makeCustomEndPoint(left: number, top: number): fabric.Image {
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

function makeLineP0FromP3(
    p3: fabric.Object,
    ObjOptions: fabric.IObjectOptions
): [fabric.Path, fabric.Image] {
    const pointPosition = [
        p3.left! + endPointOffset,
        p3.top! + endPointOffset,
    ] as [number, number];

    //set the path of the line
    const line = makeLinePath(pointPosition, pointPosition, "frame_line");
    const p0 = makeCustomEndPoint(
        pointPosition[0] - endPointOffset,
        pointPosition[1] - endPointOffset
    );
    p0.set({ opacity: 0.5, ...unMovableOptions, name: "p0" });

    linkEndPointsToLine(line, p0, p3);
    setObjsOptions([line, p0, p3], { currentType: "line", ...ObjOptions });
    return [line, p0];
}

const imageObject = (imgId: string): fabric.Image => {
    const imgElement = document.getElementById(imgId) as HTMLImageElement;
    const imgInstance = new fabric.Image(imgElement, {
        left: 100,
        top: 100,
        angle: 0,
        width: 32,
        height: 32,
    });
    return imgInstance;
};

// ---------------------------------------------------------------------
