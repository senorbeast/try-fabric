import { PointType } from "./helpers";

function cubicBezier(
    p0: PointType,
    p1: PointType,
    p2: PointType,
    p3: PointType,
    t: number
): PointType {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const p: PointType = [
        uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0],
        uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1],
    ];

    return p;
}

function distanceSquared(p1: PointType, p2: PointType): number {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return dx * dx + dy * dy;
}

function nearestPointOnCurve(
    p0: PointType,
    p1: PointType,
    p2: PointType,
    p3: PointType,
    point: PointType,
    coarseSteps: number = 10,
    fineSteps: number = 10
): { point: PointType; t: number } {
    let bestT = 0;
    let minDistance = Number.MAX_VALUE;

    // Coarse sampling
    for (let i = 0; i <= coarseSteps; i++) {
        const t = i / coarseSteps;
        const candidate = cubicBezier(p0, p1, p2, p3, t);
        const dist = distanceSquared(candidate, point);
        if (dist < minDistance) {
            minDistance = dist;
            bestT = t;
        }
    }

    // Fine sampling around the best coarse sample
    const stepSize = 1 / (coarseSteps * fineSteps);
    minDistance = Number.MAX_VALUE;
    for (let i = -fineSteps; i <= fineSteps; i++) {
        const t = bestT + i * stepSize;
        if (t < 0 || t > 1) continue; // Ensure t is within bounds
        const candidate = cubicBezier(p0, p1, p2, p3, t);
        const dist = distanceSquared(candidate, point);
        if (dist < minDistance) {
            minDistance = dist;
            bestT = t;
        }
    }

    const bestPoint = cubicBezier(p0, p1, p2, p3, bestT);
    return { point: bestPoint, t: bestT };
}

export function mapControlPointsToCurve(
    p0: PointType,
    p1: PointType,
    p2: PointType,
    p3: PointType
): [PointType, PointType] {
    const nearestP1 = nearestPointOnCurve(p0, p1, p2, p3, p1);
    const nearestP2 = nearestPointOnCurve(p0, p1, p2, p3, p2);

    return [nearestP1.point, nearestP2.point];
}

// function inverseMapControlPoints(
//     p0: PointType,
//     p1: PointType,
//     p2: PointType,
//     p3: PointType,
//     p1Prime: PointType,
//     p2Prime: PointType
// ): [PointType, PointType] {
//     // Assuming the nearestPointOnCurve function already returns the best approximation for control points mapping
//     return [p1Prime, p2Prime];
// }
