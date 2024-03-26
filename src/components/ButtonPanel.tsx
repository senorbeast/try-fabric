import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./Button";
import { fabricRefType } from "./Canvas";
import { cubic, linear, quad } from "./interpolate";
import { addCBCHelpers, drawCubic, extraProps } from "./cubic";
import {
    addRectangle,
    logObject,
    animateObjectAlongPath,
    animateFirstObject,
    animateOnPathC,
} from "./functions";
import { drawQuadratic } from "./quadratic";
import _ from "lodash";

type canvasJSONType = {
    version: string;
    objects: fabric.Object[];
};

const ButtonPanel = ({ fabricRef }: { fabricRef: fabricRefType }) => {
    const [frames, setFrames] = useState<canvasJSONType[]>([
        // loadFirstCanvas(fabricRef),
    ]);
    const oldFrame = useRef<fabric.Object[]>();
    const [currentFrame, setCurrentFrame] = useState<number>(-1);

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
        return canvas.toJSON(extraProps);
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
            canvas.renderAll.bind(canvas);
        });
        // const loadedFrame = fabricRef.current!.getObjects();
        // console.log(
        //     "Compare oldFrame, loadedFrame",
        //     deepDiff(oldFrame, loadedFrame)
        // );
    }

    // Run this whenever canvas is updated
    function updateCurrentFrame(
        frames: canvasJSONType[],
        currentFrame: number,
        fabricRef: fabricRefType
    ) {
        const canvas = fabricRef.current!;
        const newFrames = frames.map((frame, idx) => {
            if (idx === currentFrame) return canvas.toJSON(extraProps);
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
        const newFrame = [...frames, canvas.toJSON(extraProps)];
        setFrames(newFrame); // add frame
        // const oldFrame = fabricRef.current!.getObjects();
        // console.log(
        //     "Compare oldFrame, savedFrame",
        //     deepDiff(oldFrame, newFrame[currentFrame])
        // );
    }

    return (
        <div className="">
            {/* Basic + Beizers Row */}
            <div className="flex ">
                <div className="m-2 flex flex-wrap gap-2 justify-start items-center">
                    <p className="text-white">Basics:</p>
                    <Button
                        className="bg-purple-400"
                        name="rect"
                        onClick={() => addRectangle(fabricRef)}
                    />
                    <Button
                        name="logObject"
                        onClick={() => logObject(fabricRef)}
                    />
                </div>
                <div className="m-2 flex flex-wrap gap-2 justify-start items-center">
                    <p className="text-white">Beizers/Lines:</p>
                    <Button
                        name="drawQuadratic"
                        onClick={() => drawQuadratic(fabricRef)}
                    />
                    <Button
                        name="drawCubic"
                        onClick={() => drawCubic(fabricRef)}
                    />
                </div>
            </div>
            {/* Animate */}
            <div className="m-2 flex flex-wrap gap-2 w-[800px] justify-start items-center">
                <p className="text-white">Animate:</p>

                {/* <Button name="path" onClick={() => addPath(fabricRef)} /> */}
                {/* <Button name="resetPos" onClick={() => resetPos(fabricRef)} /> */}
                <Button
                    name="animateOnPathC"
                    onClick={() => animateOnPathC(fabricRef)}
                />

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
                    name="from-to-line"
                    onClick={() =>
                        animateFirstObject(
                            fabricRef,
                            600,
                            600,
                            300,
                            300,
                            500,
                            () => console.log("Done")
                        )
                    }
                />
            </div>
            {/* Frames */}
            <div className="m-2 flex flex-wrap gap-2 justify-start items-center">
                <p className="text-white">Frames:</p>
                <div className="flex rounded-md">
                    {frames.map((_, idx) => (
                        <button
                            key={idx}
                            className={`w-8 border-2 ${
                                currentFrame == idx
                                    ? "bg-purple-800"
                                    : "bg-white"
                            }`}
                            onClick={() =>
                                applyOldFrame(frames, idx, fabricRef)
                            }
                        >
                            {idx}
                        </button>
                    ))}
                    <button
                        className="bg-white w-8 border-2"
                        onClick={() =>
                            addNewFrame(frames, currentFrame, fabricRef)
                        }
                    >
                        +
                    </button>
                    <p className="text-white m-1">
                        Current Frame No: {currentFrame}
                    </p>
                </div>
                {frames.length > 0 ? (
                    <>
                        <p className="text-white">Animate:</p>
                        <Button name="▶" onClick={() => {}} />
                        <Button name="⏸" onClick={() => {}} />{" "}
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default ButtonPanel;
