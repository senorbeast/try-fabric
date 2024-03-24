import { useEffect, useState } from "react";
import Button from "./Button";
import { fabricRefType } from "./Canvas";
import { cubic, linear, quad } from "./covertors";
import { drawCubic } from "./cubic";
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
    const [frames, setFrames] = useState<canvasJSONType[]>([]);
    const [currentFrame, setCurrentFrame] = useState<number>(0);

    // # on mount only once
    // useEffect(() => {
    //     // memoize
    //     addNewFrame(frames, currentFrame, fabricRef);
    //     return () => {};
    // }, []);

    // # whenever fabricRef changes ?
    useEffect(() => {
        // memoize
        updateCurrentFrame(frames, currentFrame, fabricRef);

        return () => {};
    }, [fabricRef]);

    function applyOldFrame(
        frames: canvasJSONType[],
        idx: number,
        fabricRef: fabricRefType
    ) {
        const canvas = fabricRef.current!;
        setCurrentFrame(idx);
        canvas.loadFromJSON(frames[idx], () =>
            console.log("Updated current canvas")
        );
    }

    function updateCurrentFrame(
        frames: canvasJSONType[],
        currentFrame: number,
        fabricRef: fabricRefType
    ) {
        const canvas = fabricRef.current!;
        const newFrames = frames.map((frame, idx) => {
            if (idx === currentFrame) return canvas.toJSON();
            else return frame;
        });

        setFrames(newFrames);
    }

    function addNewFrame(
        frames: canvasJSONType[],
        currentFrame: number,
        fabricRef: fabricRefType
    ) {
        const canvas = fabricRef.current!;
        setCurrentFrame(currentFrame + 1); // increment currentFrame
        setFrames([...frames, canvas.toJSON()]); // add frame
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
                        className="bg-white w-8 border-2"
                        onClick={() => applyOldFrame(frames, idx, fabricRef)}
                    >
                        {idx}
                    </button>
                ))}
                <button
                    className="bg-white w-8 border-2"
                    onClick={() => addNewFrame(frames, currentFrame, fabricRef)}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default ButtonPanel;
