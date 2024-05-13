export {
    linkControlPointsToLine,
    linkEndPointsToLine,
    linkLinetoPoints,
    unLinkControlPointsFromLine,
};

function linkLinetoPoints(
    line: fabric.Path,
    p0?: fabric.Object,
    p1?: fabric.Object,
    p2?: fabric.Object,
    p3?: fabric.Object
) {
    const ptsArr = [p0, p1, p2, p3];
    // TODO: correct types, use optional types maybe
    ptsArr.forEach((pt) => {
        if (pt) {
            pt.hasBorders = pt.hasControls = false;
            pt.line1 = null;
            pt.line2 = null;
            pt.line3 = null;
            pt.line4 = null;
        }
    });
    // Connect existing points with the path line
    if (p0) {
        p0.line1 = line;
    }
    if (p1) {
        p1.line2 = line;
    }
    if (p2) {
        p2.line3 = line;
    }
    if (p3) {
        p3.line4 = line;
    }
}

function linkEndPointsToLine(
    line: fabric.Path,
    p0: fabric.Object,
    p3: fabric.Object
) {
    const ptsArr = [p0, p3];
    ptsArr.forEach((pt) => {
        pt.hasBorders = pt.hasControls = false;
        pt.line1 = null;
        pt.line2 = null;
        pt.line3 = null;
        pt.line4 = null;
    });
    // Connect existing points with the path line
    p0.line1 = line;
    p3.line4 = line;
}

function linkControlPointsToLine(
    line: fabric.Path,
    p1: fabric.Object,
    p2: fabric.Object
) {
    const ptsArr = [p1, p2];
    ptsArr.forEach((pt) => {
        pt.hasBorders = pt.hasControls = false;
        pt.line1 = null;
        pt.line2 = null;
        pt.line3 = null;
        pt.line4 = null;
    });
    // Connect existing points with the path line
    p1.line2 = line;
    p2.line3 = line;
}

function unLinkControlPointsFromLine(p1: fabric.Object, p2: fabric.Object) {
    const ptsArr = [p1, p2];
    ptsArr.forEach((pt) => {
        pt.hasBorders = pt.hasControls = false;
        pt.line1 = null;
        pt.line2 = null;
        pt.line3 = null;
        pt.line4 = null;
    });
}
