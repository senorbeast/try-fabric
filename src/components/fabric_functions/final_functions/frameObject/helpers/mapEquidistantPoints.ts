import { PointType } from "../../helper.types";

export function findEquidistantPoints(
    startPoint: PointType,
    endPoint: PointType
): [PointType, PointType] {
    // Calculate slope of the line
    // const slope = (endPoint[1] - startPoint[1]) / (endPoint[0] - startPoint[0]);

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
    ] as PointType;
    const equidistantPoint2 = [
        endPoint[0] - equidistantDistance * directionVector[0],
        endPoint[1] - equidistantDistance * directionVector[1],
    ] as PointType;

    return [equidistantPoint1, equidistantPoint2];
}
