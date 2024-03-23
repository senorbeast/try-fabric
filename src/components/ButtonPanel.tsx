import { fabric } from "fabric";
import Button from "./Button";
import { fabricRefType } from "./Canvas";
import { drawQuadratic } from "./utils";
import { interpolatePath } from "./covertors";

const addRectangle = (fabricRef: fabricRefType) => {
    const rect = new fabric.Rect({
        top: 50,
        left: 50,
        width: 50,
        height: 50,
        fill: "red",
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

function animateObjectAlongPath(
    fabricRef: fabricRefType,
    // path: string[],
    // duration: number,
    onComplete: () => void | undefined
) {
    const canvas = fabricRef.current!;

    // Use first object
    const firstObj = fabricRef.current!.getObjects()[0];

    // points on path
    const points: PointType[] = [];
    const percentageIncrement = 0.01;

    const path: (string | number)[][] = [
        ["M", 100, 100],
        ["Q", 200, 200, 300, 100],
    ];

    for (
        let percentage = 0;
        percentage <= 1;
        percentage += percentageIncrement
    ) {
        points.push(interpolatePath(path, percentage));
    }
    console.log(points);
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

// Animate object along the curved path
function animateAlongPath(fabricRef: fabricRefType) {
    const canvas = fabricRef.current!;
    // Use first object
    const firstObj = fabricRef.current!.getObjects()[0];

    const duration = 500;
    const path = new fabric.Path("M 100 100 Q 200 50 300 100 T 500 100", {
        fill: "",
        stroke: "black",
        strokeWidth: 2,
    });
    // animate

    const startTime = new Date().getTime();
    const animationInterval = 1000 / 60; // 60 fps

    function updatePosition() {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - startTime;
        const t = elapsedTime / duration;

        if (t < 1) {
            const point = calculateQuadraticBezierPoint(
                { x: path.path[0][1], y: path.path[0][2] },
                { x: path.path[1][1], y: path.path[1][2] },
                { x: path.path[1][3], y: path.path[1][4] },
                t
            );
            firstObj.set({ left: point.x, top: point.y });
            canvas.renderAll();
            setTimeout(updatePosition, animationInterval);
        } else {
            firstObj.set({ left: path.path![0].x, top: path.path![0].y });
            canvas.renderAll();
            console.log("Animation along path complete");
        }
    }

    updatePosition();
}

const animateCurve = (fabricRef: fabricRefType) => {
    const canvas = fabricRef.current!;
    // Use first object
    const firstObj = fabricRef.current!.getObjects()[0];

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

// const logObject = (fabricRef: fabricRefType, points: PointType[]) => {
//     const canvas = fabricRef.current!;
//     // Use first object
//     const firstObj = fabricRef.current!.getObjects()[0];

//     points.forEach((point) => addRectangle(fabricRef));

//     console.log(firstObj);
// };

const logObject = (fabricRef: fabricRefType) => {
    // Use first object
    const firstObj = fabricRef.current!.getObjects()[0];

    console.log(firstObj);
};

const ButtonPanel = ({ fabricRef }: { fabricRef: fabricRefType }) => {
    return (
        <div className="flex gap-5">
            <Button name="rect" onClick={() => addRectangle(fabricRef)} />
            <Button name="path" onClick={() => addPath(fabricRef)} />
            <Button name="resetPos" onClick={() => resetPos(fabricRef)} />
            <Button name="to-left" onClick={() => animateLeft(fabricRef)} />
            <Button name="to-curve" onClick={() => animateCurve(fabricRef)} />
            <Button name="logObject" onClick={() => logObject(fabricRef)} />
            <Button
                name="animateObjectAlongPath"
                onClick={() =>
                    animateObjectAlongPath(fabricRef, () =>
                        console.log("Completed Path Animate")
                    )
                }
            />
            <Button
                name="drawQuadratic"
                onClick={() => drawQuadratic(fabricRef)}
            />
            <Button
                name="from-to-line"
                onClick={() =>
                    animateFirstObject(fabricRef, 600, 600, 300, 300, 500)
                }
            />
        </div>
    );
};

export default ButtonPanel;
