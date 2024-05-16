import { fabricRefType } from "../../../../Canvas";
import { fOIdsState } from "../../react-ridge";
import { getReqObjByNamesForID } from "../helpers/getterSetters";
import { linkLinetoPoints } from "../helpers/linkage";

export function runAfterJSONLoad(fabricRef: fabricRefType) {
    const fOIds = fOIdsState.get();
    fOIds.forEach((fOId) => {
        findAndLinkOneGroup(fabricRef, fOId);
    });
}

const findAndLinkOneGroup = (
    fabricRef: fabricRefType,
    commonID: string,
    objects?: fabric.Object[]
) => {
    // const { line, points } = getReqObj(canvas);
    const canvas = fabricRef.current!;
    const [lineO, p0, p1, p2, p3] = getReqObjByNamesForID(
        canvas,
        commonID,
        ["frame_line", "p0", "p1", "p2", "p3"],
        objects
    );

    // console.log("Linking existing points");
    if (lineO) {
        // console.log("Line found!", line1.commonID);
        const line = lineO as fabric.Path;
        // To fix position of line after loading
        line!.height = 0;
        line!.width = 0;
        line.pathOffset.x = line.left!;
        line.pathOffset.y = line.top!;

        // Link existing points
        // const [p0, p1, p2, p3] = points;
        linkLinetoPoints(line, p0!, p1!, p2!, p3!);
    }

    // bindCubicEvents(canvas);
    canvas.renderAll();
};
