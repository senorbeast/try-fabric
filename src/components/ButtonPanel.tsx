import Button from "./Button";
import { fabricRefType } from "./Canvas";
import {
    addRectangle,
    addPath,
    resetPos,
    animateLeft,
    animateCurve,
    logObject,
    animateObjectAlongPath,
    animateFirstObject,
    animateOnPathC,
} from "./functions";
import { drawQuadratic } from "./utils";

const ButtonPanel = ({ fabricRef }: { fabricRef: fabricRefType }) => {
    return (
        <div className="flex gap-5">
            <Button name="rect" onClick={() => addRectangle(fabricRef)} />
            <Button name="path" onClick={() => addPath(fabricRef)} />
            <Button name="resetPos" onClick={() => resetPos(fabricRef)} />
            <Button
                name="animateOnPathC"
                onClick={() => animateOnPathC(fabricRef)}
            />
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
                    animateFirstObject(fabricRef, 600, 600, 300, 300, 500, () =>
                        console.log("Done")
                    )
                }
            />
        </div>
    );
};

export default ButtonPanel;
