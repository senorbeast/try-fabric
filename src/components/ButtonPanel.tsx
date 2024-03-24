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

const ButtonPanel = ({ fabricRef }: { fabricRef: fabricRefType }) => {
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
        </div>
    );
};

export default ButtonPanel;
