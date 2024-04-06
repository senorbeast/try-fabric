import { canvasJSONType } from "../ButtonPanel";
import { fabricRefType } from "../Canvas";
import { animateObjectAlongPath } from "./common";
import { frameObject } from "./frame_object";
import fabric from "./custom_attribute";

export {
    getReqObjBy,
    getReqObjByNames,
    setObjsOptions,
    newObjectForNewFrame,
    animateOverFrames,
    findEquidistantPoints,
    mapControlPointsOnCurve,
    calculateControlPoints,
};

function getReqObjByNames(
    canvas: fabric.Canvas,
    ids: string[],
    objects?: fabric.Object[]
) {
    const result: (fabric.Object | null)[] = [];
    const filterObjects = objects ?? canvas.getObjects();

    ids.forEach((id, index) => {
        filterObjects.forEach((obj) => {
            if (id == obj.name) {
                result.push(obj);
            }
        });
        if (result.length == index) result.push(null);
    });
    return result;
}

function getReqObjBy(
    canvas: fabric.Canvas,
    key: string,
    value: string
): (fabric.Object | null)[] {
    const result: (fabric.Object | null)[] = [];
    canvas.getObjects().forEach((obj) => {
        if (value == obj[key]) {
            result.push(obj);
        }
    });
    return result;
}

function setObjsOptions(
    objects: fabric.Object[],
    options: fabric.IObjectOptions
) {
    objects.forEach((obj) => {
        obj.set(options);
    });
}

// For each new frame, old cbc FO, are converted to line FO,
// starting at end point of cbc
// keep same ids/names
function newObjectForNewFrame(fabricRef: fabricRefType) {
    const canvas = fabricRef.current!;
    const [line, p0, p1, p2, p3] = getReqObjByNames(canvas, [
        "frame_line",
        "p0",
        "p1",
        "p2",
        "p3",
    ]);

    const endPoint = [p3.left, p3.top];

    const oldOptions: fabric.IUtilObject = {
        initialFrame: p3.initialFrame,
    };

    console.log("In newObjectForNewFrame", oldOptions);

    canvas.remove(line, p0, p1, p2, p3);

    //TODO: need to load old objects attribute in new frame

    frameObject(
        fabricRef,
        endPoint,
        endPoint,
        "someUUID",
        "frame_line",
        false,
        oldOptions
    );
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
        if (frame !== undefined) {
            frame.objects.forEach((obj) => {
                if (obj.name == "frame_line") {
                    allPaths.push(obj.path);
                }
            });
        }
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
    return findClosestPointsOnCurve(start, end, control1, control2);

    // const [x0, y0] = start;
    // const [x3, y3] = end;
    // const [x1, y1] = control1;
    // const [x2, y2] = control2;
    // const dx1 = x1 - x0;
    // const dy1 = y1 - y0;
    // const dx2 = x2 - x3;
    // const dy2 = y2 - y3;
    // const xc1 = x0 + dx1 / 3;
    // const yc1 = y0 + dy1 / 3;
    // const xc2 = x3 - dx2 / 3;
    // const yc2 = y3 - dy2 / 3;
    // return [
    //     [xc1, yc1],
    //     [xc2, yc2],
    // ];
}

function cubicBezier(
    startX: number,
    startY: number,
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    endX: number,
    endY: number,
    t: number
): PointType {
    const invT = 1 - t;
    const invT2 = invT * invT;
    const t2 = t * t;
    const t3 = t2 * t;

    const x =
        startX * invT * invT2 +
        3 * cp1x * t * invT2 +
        3 * cp2x * invT * t2 +
        endX * t3;
    const y =
        startY * invT * invT2 +
        3 * cp1y * t * invT2 +
        3 * cp2y * invT * t2 +
        endY * t3;

    return [x, y];
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function findClosestPointsOnCurve(
    startPoint: PointType,
    endPoint: PointType,
    controlPoint1: PointType,
    controlPoint2: PointType,
    numSteps: number = 1000
): [PointType, PointType] {
    const [startX, startY] = startPoint;
    const [endX, endY] = endPoint;
    const [cp1x, cp1y] = controlPoint1;
    const [cp2x, cp2y] = controlPoint2;

    let minDistance1 = Infinity;
    let closestPoint1: PointType = [];
    for (let t = 0; t <= 1; t += 1 / numSteps) {
        const [x, y] = cubicBezier(
            startX,
            startY,
            cp1x,
            cp1y,
            cp2x,
            cp2y,
            endX,
            endY,
            t
        );
        const dist = distance(cp1x, cp1y, x, y);
        if (dist < minDistance1) {
            minDistance1 = dist;
            closestPoint1 = [x, y];
        }
    }

    let minDistance2 = Infinity;
    let closestPoint2: PointType = [];
    for (let t = 0; t <= 1; t += 1 / numSteps) {
        const [x, y] = cubicBezier(
            startX,
            startY,
            cp1x,
            cp1y,
            cp2x,
            cp2y,
            endX,
            endY,
            t
        );
        const dist = distance(cp2x, cp2y, x, y);
        if (dist < minDistance2) {
            minDistance2 = dist;
            closestPoint2 = [x, y];
        }
    }

    return [closestPoint1, closestPoint2];
}
// With derivates

// // Function to calculate the derivative of the cubic Bezier curve at a specific t value
// function cubicBezierDerivative(startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY, t) {
//     const dX = 3 * (cp1x - startX) * (1 - t) ** 2 + 6 * (cp2x - cp1x) * (1 - t) * t + 3 * (endX - cp2x) * t ** 2;
//     const dY = 3 * (cp1y - startY) * (1 - t) ** 2 + 6 * (cp2y - cp1y) * (1 - t) * t + 3 * (endY - cp2y) * t ** 2;
//     return [dX, dY];
// }

// // Function to find the points on the curve with shortest distance to a given point
// function findClosestPointsOnCurve(svgPath, point) {
//     const bezierFunction = parseSVGPath(svgPath);

//     // Function to calculate the distance between a point on the curve and the given point
//     function distanceToCurve(t) {
//         const [x, y] = bezierFunction(t);
//         return distance(point[0], point[1], x, y);
//     }

//     // Function to calculate the derivative of the distance function
//     function distanceDerivative(t) {
//         const [x, y] = bezierFunction(t);
//         const [dX, dY] = cubicBezierDerivative(...points, t);
//         const d = distance(point[0], point[1], x, y);
//         const dotProduct = (x - point[0]) * dX + (y - point[1]) * dY;
//         return dotProduct / d;
//     }

//     // Use a numerical optimization method to find the minimum of the distance function
//     const tMin = numeric.optimize(distanceToCurve, distanceDerivative, 0, 1);

//     return [bezierFunction(tMin)];
// }

// // Example usage:
// const svgPath = "M 100 100 C 200 50 400 50 400 100";
// const closestPoint = findClosestPointsOnCurve(svgPath, [2, 0]);
// console.log("Closest point on the curve:", closestPoint);
