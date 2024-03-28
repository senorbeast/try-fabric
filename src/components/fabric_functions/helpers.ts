import { canvasJSONType } from "../ButtonPanel";
import { fabricRefType } from "../Canvas";
import { animateObjectAlongPath } from "./common";
import { frameObject } from "./frame_object";

export {
    getReqObjByIds,
    cbcToLineForNewFrame,
    animateOverFrames,
    findEquidistantPoints,
    mapControlPointsOnCurve,
    calculateControlPoints,
};

function getReqObjByIds(canvas: fabric.Canvas, ids: string[]) {
    const result: (fabric.Object | null)[] = [];

    ids.forEach((id, index) => {
        canvas.getObjects().forEach((obj) => {
            if (id == obj.name) {
                result.push(obj);
            }
        });
        if (result.length == index) result.push(null);
    });

    return result;
}

// For each new frame, old cbc FO, are converted to line FO,
// starting at end point of cbc
// keep same ids/names
function cbcToLineForNewFrame(fabricRef: fabricRefType) {
    const canvas = fabricRef.current!;
    // Get id/name and endPoint for currentFrame
    const [line, p0, p1, p2, p3] = getReqObjByIds(canvas, [
        "frame_line",
        "p0",
        "p1",
        "p2",
        "p3",
    ]);
    const endPoint = getEndPoint(line);
    console.log(line, endPoint);
    const name = line?.name;
    // //TODO: safely remove object and its listeners
    canvas.remove(line, p0, p1, p2, p3);
    // canvas.clear();
    frameObject(fabricRef, endPoint, endPoint, name);
}

function getEndPoint(line: fabric.Object): [number, number] {
    const path = line.path;
    if (path[1][0] == "L") {
        return [path[1][1], path[1][2]];
    }
    // else if(path[1][0] == 'C'){
    return [path[1][5], path[1][6]];
}

// lifecycle of frame

// Start objects as frameObject - line, on single point
// they usually end up as fO line or curve

// new-Frame
// remove eventListeners, old line/curve
// replace them with fO on endPoint, on single point + use old ids/names

function animateOverFrames(fabricRef: fabricRefType, frames: canvasJSONType[]) {
    const allPaths: (string | number)[][][] = [];
    console.log(frames);

    // Fill in paths across frames
    frames.forEach((frame) => {
        frame.objects.forEach((obj) => {
            if (obj.name == "frame_line") {
                allPaths.push(obj.path);
            }
        });
    });

    console.log(allPaths);

    // animate
    let currentFrame = 0;
    const sequenceAnimation = () => {
        if (currentFrame < frames.length) {
            animateObjectAlongPath(fabricRef, allPaths[currentFrame], () => {
                currentFrame++;
                sequenceAnimation();
            });
        }
    };
    sequenceAnimation();
}

export type PointType = [number, number];

function findEquidistantPoints(
    startPoint: PointType,
    endPoint: PointType
): [PointType, PointType] {
    // Calculate slope of the line
    const slope = (endPoint[1] - startPoint[1]) / (endPoint[0] - startPoint[0]);

    // Calculate distance between start and end points
    const distance = Math.sqrt(
        (endPoint[0] - startPoint[0]) ** 2 + (endPoint[1] - startPoint[1]) ** 2
    );

    // Determine direction vector
    const dx = endPoint[0] - startPoint[0];
    const dy = endPoint[1] - startPoint[1];

    // Normalize direction vector
    const length = Math.sqrt(dx * dx + dy * dy);
    const directionVector = [dx / length, dy / length];

    // Calculate distance from start point to equidistant points
    const equidistantDistance = distance / 3; // Dividing by 3 to get equidistant points closer to the ends

    // Calculate equidistant points
    const equidistantPoint1 = [
        startPoint[0] + equidistantDistance * directionVector[0],
        startPoint[1] + equidistantDistance * directionVector[1],
    ];
    const equidistantPoint2 = [
        endPoint[0] - equidistantDistance * directionVector[0],
        endPoint[1] - equidistantDistance * directionVector[1],
    ];

    return [equidistantPoint1, equidistantPoint2];
}

function mapControlPointsOnCurve(
    startPoint: PointType,
    endPoint: PointType,
    controlPoint1: PointType,
    controlPoint2: PointType
): [PointType, PointType] {
    // Function to calculate point on Bezier curve
    function bezierPoint(
        t: number,
        p0: PointType,
        p1: PointType,
        p2: PointType,
        p3: PointType
    ): PointType {
        const [x0, y0] = p0;
        const [x1, y1] = p1;
        const [x2, y2] = p2;
        const [x3, y3] = p3;

        const cx = 3 * (x1 - x0);
        const bx = 3 * (x2 - x1) - cx;
        const ax = x3 - x0 - cx - bx;

        const cy = 3 * (y1 - y0);
        const by = 3 * (y2 - y1) - cy;
        const ay = y3 - y0 - cy - by;

        const tSquared = t * t;
        const tCubed = tSquared * t;
        const x = ax * tCubed + bx * tSquared + cx * t + x0;
        const y = ay * tCubed + by * tSquared + cy * t + y0;
        return [x, y];
    }

    // Calculate points at t=0.25 and t=0.75
    const point1 = bezierPoint(
        0.25,
        startPoint,
        controlPoint1,
        controlPoint2,
        endPoint
    );
    const point2 = bezierPoint(
        0.75,
        startPoint,
        controlPoint1,
        controlPoint2,
        endPoint
    );

    return [point1, point2];
}

// Function to calculate control points for a cubic Bézier curve
function calculateControlPoints(
    start: PointType,
    end: PointType,
    control1: PointType,
    control2: PointType
): [PointType, PointType] {
    const [x0, y0] = start;
    const [x3, y3] = end;
    const [x1, y1] = control1;
    const [x2, y2] = control2;

    const dx1 = x1 - x0;
    const dy1 = y1 - y0;
    const dx2 = x2 - x3;
    const dy2 = y2 - y3;

    const xc1 = x0 + dx1 / 3;
    const yc1 = y0 + dy1 / 3;
    const xc2 = x3 - dx2 / 3;
    const yc2 = y3 - dy2 / 3;

    return [
        [xc1, yc1],
        [xc2, yc2],
    ];
}
