import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./Button";
import { fabricRefType } from "./Canvas";
import { cubic, linear, quad } from "./fabric_functions/interpolate";
import { addCBCHelpers, drawCubic } from "./fabric_functions/cubic";
import {
    addRectangle,
    logObject,
    animateObjectAlongPath,
    animateFirstObject,
    animateOnPathC,
    addImageObject,
} from "./fabric_functions/common";
import { drawQuadratic } from "./fabric_functions/quadratic";
import _ from "lodash";
import { drawLine, runAfterJSONLoadLine } from "./fabric_functions/line";
import {
    extraProps,
    frameObject,
    runAfterJSONLoad,
} from "./fabric_functions/frame_object";
import {
    animateOverFrames,
    cbcToLineForNewFrame,
    getReqObjByIds,
} from "./fabric_functions/helpers";

export type canvasJSONType = {
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
        // console.log("Called through useCallback");
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

    // Store currentFrame to canvas object
    useEffect(() => {
        if (fabricRef.current) {
            const canvas = fabricRef.current!;
            const [store] = getReqObjByIds(canvas, ["invisibleStore"]);
            if (store) {
                store.currentFrame = currentFrame;
            }
        }
        return () => {};
    }, [currentFrame, fabricRef]);

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
            addCBCHelpers(fabricRef, "frame_line");
            // runAfterJSONLoad(fabricRef);
            // addCBCHelpers(fabricRef, "cubeLine");
            // runAfterJSONLoad(fabricRef);
            // runAfterJSONLoadLine(fabricRef);
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
        // console.log("Update current Frames", newFrames);

        setFrames(newFrames);
    }

    // after tapping +
    function addNewFrame(frames: canvasJSONType[], fabricRef: fabricRefType) {
        const canvas = fabricRef.current!;
        setCurrentFrame(frames.length);
        const newFrame = [...frames, canvas.toJSON(extraProps)];
        setFrames(newFrame); // add frame
        cbcToLineForNewFrame(fabricRef);

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
                    <Button
                        name="logEvents"
                        onClick={() => {
                            const canvas = fabricRef.current!;
                            console.log(canvas.__eventListeners);
                        }}
                    />

                    <button
                        className=""
                        onClick={() => addImageObject(fabricRef, "my-image")}
                    >
                        <img
                            src="data:image/png;base64,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"
                            id="my-image"
                            width="40px"
                            height="40px"
                        ></img>
                    </button>
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
                    <Button
                        name="drawLine"
                        onClick={() => drawLine(fabricRef)}
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
                <div className="flex">
                    {frames.map((_, idx) => (
                        <button
                            key={idx}
                            className={`w-8 border-2 ${
                                frames.length - 1 > idx
                                    ? "bg-green-400"
                                    : "bg-white"
                            }
                            ${currentFrame == idx ? "font-bold" : ""}
                            `}
                            onClick={() =>
                                applyOldFrame(frames, idx, fabricRef)
                            }
                        >
                            {idx}
                        </button>
                    ))}
                    <button
                        className="bg-white w-8 border-2"
                        onClick={() => addNewFrame(frames, fabricRef)}
                    >
                        +
                    </button>
                    <p className="text-white m-1">
                        Current Frame No: {currentFrame}
                    </p>
                </div>
                {frames.length > 1 ? (
                    <>
                        <p className="text-white">Animate:</p>
                        <Button
                            name="▶"
                            onClick={() => {
                                animateOverFrames(fabricRef, frames);
                            }}
                        />
                        <Button name="⏸" onClick={() => {}} />{" "}
                    </>
                ) : null}
            </div>
            <div className="m-2 flex flex-wrap gap-2 justify-start items-center">
                <p className="text-white">Tactic Obj:</p>
                <Button
                    name="frameObject"
                    onClick={() =>
                        frameObject(
                            fabricRef,
                            [100, 100],
                            [100, 100],
                            "frame_line"
                        )
                    }
                />
                <Button
                    name="newFrameLine"
                    onClick={() => cbcToLineForNewFrame(fabricRef)}
                />
            </div>
        </div>
    );
};

export default ButtonPanel;
