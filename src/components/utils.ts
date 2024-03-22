import { fabricRefType } from "./Canvas";
import { fabric } from "fabric";

export function animateDrag(fabricRef: fabricRefType) {
    const canvas = fabricRef.current!;

    // disable controls and set hover-cursor
    canvas.forEachObject(function (o) {
        o.hasBorders = o.hasControls = false;
    });
    canvas.hoverCursor = "pointer";

    // mouse events
    canvas.on("mouse:down", function (e) {
        animate(e, 1);
    });
    canvas.on("mouse:up", function (e) {
        animate(e, 0);
    });

    function animate(e: fabric.IEvent<MouseEvent>, p: 0 | 1) {
        if (e.target) {
            fabric.util.animate({
                startValue: e.target.get("height"),
                endValue:
                    e.target.get("height")! + (p ? -10 : 50 - e.target.height!),
                duration: 200,
                onChange: function (v) {
                    e.target!.height = v;
                    canvas.renderAll();
                },
                onComplete: function () {
                    e.target.setCoords();
                },
            });
            fabric.util.animate({
                startValue: e.target.get("width"),
                endValue:
                    e.target.get("width") + (p ? -10 : 50 - e.target.width),
                duration: 200,
                onChange: function (v) {
                    e.target.width = v;
                    canvas.renderAll();
                },
                onComplete: function () {
                    e.target.setCoords();
                },
            });
            fabric.util.animate({
                startValue: e.target.get("top"),
                endValue: e.target.get("top") + (p && 5),
                duration: 200,
                onChange: function (v) {
                    e.target.top = v;
                    canvas.renderAll();
                },
                onComplete: function () {
                    e.target.setCoords();
                },
            });
            fabric.util.animate({
                startValue: e.target.get("left"),
                endValue: e.target.get("left") + (p && 5),
                duration: 200,
                onChange: function (v) {
                    e.target.left = v;
                    canvas.renderAll();
                },
                onComplete: function () {
                    e.target.setCoords();
                },
            });
        }
    }
    canvas.renderAll();
}

export const drawQuadratic = (fabricRef: fabricRefType) => {
    const canvas = fabricRef.current!;

    canvas.on({
        "object:selected": onObjectSelected,
        "object:moving": onObjectMoving,
        "selection:cleared": onSelectionCleared,
    });

    const line = new fabric.Path("M 65 0 Q 100, 100, 200, 0", {
        fill: "",
        stroke: "black",
        objectCaching: false,
    });

    line.path[0][1] = 100;
    line.path[0][2] = 100;

    line.path[1][1] = 200;
    line.path[1][2] = 200;

    line.path[1][3] = 300;
    line.path[1][4] = 100;

    line.selectable = false;
    canvas.add(line);

    const p1 = makeCurvePoint(200, 200, null, line, null);
    p1.name = "p1";
    canvas.add(p1);

    const p0 = makeCurveCircle(100, 100, line, p1, null);
    p0.name = "p0";
    canvas.add(p0);

    const p2 = makeCurveCircle(300, 100, null, p1, line);
    p2.name = "p2";
    canvas.add(p2);
};

function makeCurveCircle(left, top, line1, line2, line3) {
    const c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 5,
        radius: 12,
        fill: "#fff",
        stroke: "#666",
    });

    c.hasBorders = c.hasControls = false;

    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;

    return c;
}

function makeCurvePoint(left, top, line1, line2, line3) {
    const c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 8,
        radius: 14,
        fill: "#fff",
        stroke: "#666",
    });

    c.hasBorders = c.hasControls = false;

    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;

    return c;
}

function onObjectSelected(e) {
    var activeObject = e.target;

    if (activeObject.name == "p0" || activeObject.name == "p2") {
        activeObject.line2.animate("opacity", "1", {
            duration: 200,
            onChange: canvas.renderAll.bind(canvas),
        });
        activeObject.line2.selectable = true;
    }
}

function onSelectionCleared(e) {
    var activeObject = e.target;
    if (activeObject.name == "p0" || activeObject.name == "p2") {
        activeObject.line2.animate("opacity", "0", {
            duration: 200,
            onChange: canvas.renderAll.bind(canvas),
        });
        activeObject.line2.selectable = false;
    } else if (activeObject.name == "p1") {
        activeObject.animate("opacity", "0", {
            duration: 200,
            onChange: canvas.renderAll.bind(canvas),
        });
        activeObject.selectable = false;
    }
}

function onObjectMoving(e) {
    if (e.target.name == "p0" || e.target.name == "p2") {
        var p = e.target;

        if (p.line1) {
            p.line1.path[0][1] = p.left;
            p.line1.path[0][2] = p.top;
        } else if (p.line3) {
            p.line3.path[1][3] = p.left;
            p.line3.path[1][4] = p.top;
        }
    } else if (e.target.name == "p1") {
        var p = e.target;

        if (p.line2) {
            p.line2.path[1][1] = p.left;
            p.line2.path[1][2] = p.top;
        }
    } else if (e.target.name == "p0" || e.target.name == "p2") {
        var p = e.target;

        p.line1 && p.line1.set({ x2: p.left, y2: p.top });
        p.line2 && p.line2.set({ x1: p.left, y1: p.top });
        p.line3 && p.line3.set({ x1: p.left, y1: p.top });
        p.line4 && p.line4.set({ x1: p.left, y1: p.top });
    }
}
