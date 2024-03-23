import { fabric } from "fabric";
import { useEffect, useRef } from "react";
import ButtonPanel from "./ButtonPanel";
import { initFabric, disposeFabric } from "./functions";

// TODO: don't use fabricRef.current!

export type fabricRefType = React.MutableRefObject<fabric.Canvas | undefined>;

const Canvas = () => {
    // just a reference without rerendering
    const fabricRef = useRef<fabric.Canvas>(); // upper canvas

    useEffect(() => {
        initFabric(fabricRef);
        return () => {
            disposeFabric(fabricRef);
        };
    }, []);

    return (
        <div className="flex-col w-full h-full">
            <ButtonPanel fabricRef={fabricRef} />
            <div className="bg-blue-700 w-fit h-fit flex">
                {/* Works without ref, since fabricjs create a upper canvas */}
                <canvas id="canvas" />
            </div>
        </div>
    );
};

export default Canvas;
