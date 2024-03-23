import { PointType } from "./ButtonPanel";
export type PathCommand = "M" | "L" | "Q" | "C";

export function interpolatePath(
    path: (string | number)[][],
    percentage: number
): PointType {
    let currentPoint: PointType | null = null;
    let interpolatedPoint: PointType = [0, 0];

    for (let i = 0; i < path.length; i++) {
        const command: PathCommand = path[i][0] as PathCommand;
        if (command === "M") {
            currentPoint = [path[i][1] as number, path[i][2] as number];
        } else if (command === "L") {
            if (currentPoint) {
                const x1 = currentPoint[0];
                const y1 = currentPoint[1];
                const x2 = path[i][1] as number;
                const y2 = path[i][2] as number;
                const lx = linearInterpolation(x1, x2, percentage);
                const ly = linearInterpolation(y1, y2, percentage);
                interpolatedPoint = [lx, ly];
                currentPoint = [x2, y2];
            }
        } else if (command === "Q") {
            if (currentPoint) {
                const x1 = currentPoint[0];
                const y1 = currentPoint[1];
                const x2 = path[i][1] as number;
                const y2 = path[i][2] as number;
                const x3 = path[i][3] as number;
                const y3 = path[i][4] as number;
                const qx = quadraticBezierPoint(x1, x2, x3, percentage);
                const qy = quadraticBezierPoint(y1, y2, y3, percentage);
                interpolatedPoint = [qx, qy];
                currentPoint = [x3, y3];
            }
        } else if (command === "C") {
            if (currentPoint) {
                const x1 = currentPoint[0];
                const y1 = currentPoint[1];
                const x2 = path[i][1] as number;
                const y2 = path[i][2] as number;
                const x3 = path[i][3] as number;
                const y3 = path[i][4] as number;
                const x4 = path[i][5] as number;
                const y4 = path[i][6] as number;
                const cx = cubicBezierPoint(x1, x2, x3, x4, percentage);
                const cy = cubicBezierPoint(y1, y2, y3, y4, percentage);
                interpolatedPoint = [cx, cy];
                currentPoint = [x4, y4];
            }
        }
    }
    return interpolatedPoint;
}

function linearInterpolation(p0: number, p1: number, t: number): number {
    return (1 - t) * p0 + t * p1;
}

function quadraticBezierPoint(
    p0: number,
    p1: number,
    p2: number,
    t: number
): number {
    return Math.pow(1 - t, 2) * p0 + 2 * (1 - t) * t * p1 + Math.pow(t, 2) * p2;
}

function cubicBezierPoint(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number
): number {
    return (
        Math.pow(1 - t, 3) * p0 +
        3 * Math.pow(1 - t, 2) * t * p1 +
        3 * (1 - t) * Math.pow(t, 2) * p2 +
        Math.pow(t, 3) * p3
    );
}
