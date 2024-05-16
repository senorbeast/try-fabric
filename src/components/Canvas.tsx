import { fabric } from "fabric";

import { useEffect, useRef } from "react";
import ButtonPanel from "./ButtonPanel";
import ContextMenu from "./ContextMenu";
import {
    initFabric,
    disposeFabric,
} from "./fabric_functions/final_functions/setupCanvas/initFabric";

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
        <div className="flex-col w-full h-screen bg-black">
            <div className="bg-slate-600 w-fit h-fit flex ">
                {/* Works without ref, since fabricjs create a upper canvas */}
                <canvas id="canvas" />
                <ContextMenu fabricRef={fabricRef} />
            </div>
            <ButtonPanel fabricRef={fabricRef} />
        </div>
    );
};

export default Canvas;
