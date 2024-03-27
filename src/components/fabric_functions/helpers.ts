import { frameObject } from "./frame_object";

export { getReqObjByIds, cbcToLineForNewFrame };

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
function cbcToLineForNewFrame(canvas: fabric.Canvas) {
    // Get id/name and endPoint for currentFrame
    const [line, p0, p1, p2, p3] = getReqObjByIds(canvas, [
        "frame_line",
        "p0",
        "p1",
        "p2",
        "p3",
    ]);
    if (line) {
        const endPoint = getEndPoint(line);
        const name = line?.name;
        //TODO: safely remove object and its listeners
        // canvas.removeListeners();
        // canvas.remove(line, p0, p1, p2, p3);
        // frameObject({ current: canvas }, endPoint, endPoint, name);
    }
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
