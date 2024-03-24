import { useCallback, useEffect, useState } from "react";
import Button from "./Button";
import { fabricRefType } from "./Canvas";
import { cubic, linear, quad } from "./covertors";
import { addCBCHelpers, drawCubic } from "./cubic";
import {
    addRectangle,
    logObject,
    animateObjectAlongPath,
    animateFirstObject,
    animateOnPathC,
} from "./functions";
import { drawQuadratic } from "./utils";

type canvasJSONType = {
    version: string;
    objects: fabric.Object[];
};

const ButtonPanel = ({ fabricRef }: { fabricRef: fabricRefType }) => {
    const [frames, setFrames] = useState<canvasJSONType[]>([
        // loadFirstCanvas(fabricRef),
    ]);
    const [currentFrame, setCurrentFrame] = useState<number>(0);

    const onCanvasModified = useCallback(() => {
        console.log("Called through useCallback");
        updateCurrentFrame(frames, currentFrame, fabricRef);
    }, [frames, currentFrame, fabricRef]);

    // # on mount only once
    useEffect(() => {
        // onCanvasModified();
        if (fabricRef.current) {
            loadFirstCanvas(fabricRef);
        }
        return () => {};
    }, []);

    function loadFirstCanvas(fabricRef: fabricRefType): canvasJSONType {
        const canvas = fabricRef.current!;
        return canvas.toJSON(["name"]);
    }

    // # whenever fabricRef changes, update frame
    useEffect(() => {
        const canvas = fabricRef.current!;
        // TODO: why canvas not available ?
        if (canvas) {
            canvas.on("object:modified", onCanvasModified);
        }

        return () => {};
    }, [fabricRef, onCanvasModified]);

    // when we tap old frames
    function applyOldFrame(
        frames: canvasJSONType[],
        idx: number,
        fabricRef: fabricRefType
    ) {
        const canvas = fabricRef.current!;
        setCurrentFrame(idx);
        canvas.loadFromJSON(frames[idx], () => {
            // run required functions for bezier function to work
            addCBCHelpers(fabricRef);
            // attach the controlPoints, endPoints to the path
            // attach required functions

            // console.log("Updated current canvas")
        });
    }

    // Run this whenever canvas is updated
    function updateCurrentFrame(
        frames: canvasJSONType[],
        currentFrame: number,
        fabricRef: fabricRefType
    ) {
        const canvas = fabricRef.current!;
        const newFrames = frames.map((frame, idx) => {
            if (idx === currentFrame) return canvas.toJSON(["name"]);
            else return frame;
        });
        console.log("Update current Frames", newFrames);

        setFrames(newFrames);
    }

    // after tapping +
    function addNewFrame(
        frames: canvasJSONType[],
        currentFrame: number,
        fabricRef: fabricRefType
    ) {
        const canvas = fabricRef.current!;
        setCurrentFrame(currentFrame + 1); // increment currentFrame
        const newFrame = [...frames, canvas.toJSON(["name"])];
        console.log("addNewFrame", currentFrame, newFrame);
        setFrames(newFrame); // add frame
    }

    return (
        <div className="m-2 flex flex-wrap gap-2 w-[800px]">
            <Button name="rect" onClick={() => addRectangle(fabricRef)} />
            {/* <Button name="path" onClick={() => addPath(fabricRef)} /> */}
            {/* <Button name="resetPos" onClick={() => resetPos(fabricRef)} /> */}
            <Button
                name="animateOnPathC"
                onClick={() => animateOnPathC(fabricRef)}
            />
            <Button name="logObject" onClick={() => logObject(fabricRef)} />
            <Button
                name="cubicAnimate"
                onClick={() => animateObjectAlongPath(fabricRef, cubic)}
            />
            <Button
                name="quadAnimate"
                onClick={() => animateObjectAlongPath(fabricRef, quad)}
            />
            <Button
                name="linearAnimate"
                onClick={() => animateObjectAlongPath(fabricRef, linear)}
            />
            <Button
                name="drawQuadratic"
                onClick={() => drawQuadratic(fabricRef)}
            />
            <Button name="drawCubic" onClick={() => drawCubic(fabricRef)} />
            <Button
                name="from-to-line"
                onClick={() =>
                    animateFirstObject(fabricRef, 600, 600, 300, 300, 500, () =>
                        console.log("Done")
                    )
                }
            />
            <div className="flex rounded-md">
                {frames.map((_, idx) => (
                    <button
                        key={idx}
                        className={`bg-white w-8 border-2 ${
                            currentFrame == idx + 1 ? "bg-purple-800" : ""
                        }`}
                        onClick={() =>
                            applyOldFrame(frames, idx + 1, fabricRef)
                        }
                    >
                        {idx + 1}
                    </button>
                ))}
                <button
                    className="bg-white w-8 border-2"
                    onClick={() => addNewFrame(frames, currentFrame, fabricRef)}
                >
                    +
                </button>
                <p className="text-white m-1">
                    Current Frame No: {currentFrame}
                </p>
            </div>
        </div>
    );
};

export default ButtonPanel;
