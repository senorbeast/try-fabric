import { fabric } from "fabric";
import { fabricRefType } from "../Canvas";
import { interpolatePath } from "./interpolate";
import { getReqObjByNames } from "./helpers";
import { bindFOEvents, customAttributes } from "./frame_object";

export {
    initFabric,
    disposeFabric,
    addPath,
    addPoint,
    addRectangle,
    animateCurve,
    animateFirstObject,
    animateLeft,
    animateObject,
    animateObjectAlongPath,
    resetPos,
    logObject,
    animateDrag,
    addImageObject,
    imageObject,
    animateOnPathC,
};

const initFabric = (fabricRef: fabricRefType) => {
    fabricRef.current = new fabric.Canvas("canvas", {
        height: 500,
        width: 800,
        selection: false,
    });
    invisibleStore(fabricRef);
    bindFOEvents(fabricRef);
};

const disposeFabric = (fabricRef: fabricRefType) => {
    fabricRef.current!.dispose();
};

const invisibleStore = (fabricRef: fabricRefType) => {
    const invisibleStore = new fabric.Rect({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        fill: "white",
        name: "invisibleStore",
        currentFrame: "0",
    });
    fabricRef.current!.add(invisibleStore);
};

const addRectangle = (fabricRef: fabricRefType) => {
    const rect = new fabric.Rect({
        top: 400,
        left: 50,
        width: 50,
        height: 50,
        fill: "white",
        name: "rect",
        currentFrame: "-1",
    });

    fabricRef.current!.add(rect);
};

const addPoint = (fabricRef: fabricRefType, point: PointType) => {
    const pointObj = new fabric.Rect({
        top: point[0],
        left: point[1],
        width: 5,
        height: 5,
        fill: "red",
    });

    fabricRef.current!.add(pointObj);
};

const addPath = (fabricRef: fabricRefType) => {
    const path = new fabric.Path("M 100 100 Q 200 50 300 100 T 500 100", {
        fill: "",
        stroke: "black",
        strokeWidth: 2,
    });
    fabricRef.current!.add(path);
    path.path?.forEach((point) => console.log(point.x, point.y));
};

const animateLeft = (fabricRef: fabricRefType) => {
    const canvas = fabricRef.current!;
    // Use first object
    const firstObj = fabricRef.current!.getObjects()[0];

    // animate
    firstObj.animate("left", "+=100", {
        onChange: canvas.renderAll.bind(canvas),
    });
};

// Animate the object using Fabric.js animate function
function animateFirstObject(
    fabricRef: fabricRefType,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    duration: number,
    onComplete: () => void | undefined
) {
    const canvas = fabricRef.current!;
    // Use first object
    const firstObj = fabricRef.current!.getObjects()[0];

    // Set the initial position
    firstObj.set({ left: x1, top: y1 });

    // Animate to the target position
    firstObj.animate(
        { left: x2, top: y2 }, // to
        {
            duration: duration,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: onComplete,
        }
    );
}

function animateObject(
    fabricRef: fabricRefType,
    object: fabric.Object,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    duration: number,
    onComplete: () => void | undefined
) {
    const canvas = fabricRef.current!;
    // Use first object

    // Set the initial position
    object.set({ left: x1, top: y1 });

    // Animate to the target position
    object.animate(
        { left: x2, top: y2 }, // to
        {
            duration: duration,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: onComplete,
        }
    );
}

export type PointType = [number, number];

const path: (string | number)[][] = [
    ["M", 50, 50],
    ["L", 400, 200],
    ["Q", 200, 450, 300, 100],
    // ["C", 150, 50, 300, 350, 550, 100],
    // ["M", 100, 200],
    // ["C", 150, 50, 300, 250, 350, 100],
    // ["C", 200, 200, 600, 300, 100],
];

function animateOnPathC(
    fabricRef: fabricRefType,
    // path: (string | number)[][],
    durationT?: number
) {
    const startTime = Date.now();
    const duration = durationT || 1000; // Default duration of 1 second

    const canvas = fabricRef.current!;
    // Use first object
    const object = fabricRef.current!.getObjects()[0];

    const path: (string | number)[][] = [
        ["M", 50, 50],
        ["C", 150, 50, 300, 350, 550, 100],
        ["Q", 200, 450, 300, 100],
        ["L", 400, 200],
    ];

    function animate(progress: number) {
        if (progress > 1) {
            progress = 1;
        }

        const position = interpolatePath(path, progress);
        object.set({ left: position[0], top: position[1] });
        canvas.renderAll();

        if (progress < 1) {
            const timeElapsed = Date.now() - startTime;
            const remainingTime = duration - timeElapsed;
            requestAnimationFrame(() =>
                animate(progress + remainingTime / duration)
            );
        }
    }

    animate(0);
}

function animateObjectAlongPath(
    fabricRef: fabricRefType,
    path: (string | number)[][],
    // duration: number,
    onComplete?: () => void | undefined
) {
    const canvas = fabricRef.current!;

    // Use first object
    const [firstObj] = getReqObjByNames(canvas, ["rect"]);

    // points on path
    const points: PointType[] = [];
    const percentageIncrement = 0.01;

    for (
        let percentage = 0;
        percentage <= 1;
        percentage += percentageIncrement
    ) {
        points.push(interpolatePath(path, percentage));
    }
    // console.log(points);
    const numPoints = points.length;

    let currentIndex = 0;
    const nextPoint = () => {
        if (currentIndex < numPoints) {
            const currentPoint = points[currentIndex];

            firstObj.animate(
                {
                    left: currentPoint[0],
                    top: currentPoint[1],
                },
                {
                    duration: 5, // Divide duration by number of points for even movement speed
                    onChange: canvas.renderAll.bind(canvas),
                    onComplete: () => {
                        currentIndex++;
                        nextPoint();
                    },
                }
            );
        } else if (onComplete) {
            onComplete();
        }
    };

    nextPoint(); // Start animation
}

const animateCurve = (fabricRef: fabricRefType) => {
    const canvas = fabricRef.current!;
    // Use first object
    // const firstObj = fabricRef.current!.getObjects()[0];

    // const path = fabricRef
    //     .current!.getObjects()
    //     .filter((obj) => obj.isType("path"))[0] as fabric.Path;

    const pathArray =
        "M78.2,0.1c0,0,9.4,79.1,2.3,117  c-4.5,24.1-31.8,106.2-56.3,108.7c-12.7,1.3-24.2-11.9-16.5-15.5C15,207,40.2,231.1,19,261.7c-9.8,14.1-24.7,31.9-12.5,44.9  c11.3,12,53-36.8,59.2-23.8c8.6,18-40.8,23-28,49.2c14.7,30.4,21.6,39.9,48,58.5c31.3,22,147,66.2,147.2,149.5";

    const path = new fabric.Path(pathArray, {
        fill: "",
        stroke: "black",
        strokeDashArray: [5, 5],
        strokeDashOffset: 0,
    });
    fabricRef.current!.add(path);

    function animatePath() {
        path.animate("strokeDashOffset", "-=3", {
            duration: 100,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: function () {
                // animatePath();
            },
        });
    }
    animatePath();
};

const resetPos = (fabricRef: fabricRefType) => {
    const canvas = fabricRef.current!;
    // Use first object
    const firstObj = fabricRef.current!.getObjects()[0];

    // Animate to the target position
    firstObj.animate(
        { left: 50, top: 50 }, // to
        {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: function () {
                console.log("Animation complete");
            },
        }
    );
};

const logObject = (fabricRef: fabricRefType) => {
    const allObjs = fabricRef.current!.getObjects();

    console.log(allObjs);
};

const addImageObject = (fabricRef: fabricRefType, imgId: string) => {
    const canvas = fabricRef.current!;
    const imgElement = document.getElementById(imgId);
    const imgInstance = new fabric.Image(imgElement, {
        left: 100,
        top: 100,
        angle: 0,
        opacity: 0.5,
        width: 32,
        height: 32,
    });
    canvas.add(imgInstance);
};

const imageObject = (imgId: string): fabric.Image => {
    const imgElement = document.getElementById(imgId);
    const imgInstance = new fabric.Image(imgElement, {
        left: 100,
        top: 100,
        angle: 0,
        width: 32,
        height: 32,
    });
    return imgInstance;
};

function animateDrag(fabricRef: fabricRefType) {
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
