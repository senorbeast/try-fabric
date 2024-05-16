import { fabric } from "fabric";
import { fabricRefType } from "../../../Canvas";
import { bindFOEvents } from "../events/events";
import { modifyFabricControls } from "./modifyFabricControls";

export { initFabric, disposeFabric };

const initFabric = (fabricRef: fabricRefType) => {
    fabricRef.current = new fabric.Canvas("canvas", {
        stopContextMenu: true,
        fireRightClick: true,
        height: 500,
        width: 800,
        selection: false,
    });
    // invisibleStore(fabricRef);
    modifyFabricControls();
    bindFOEvents(fabricRef);
};

const disposeFabric = (fabricRef: fabricRefType) => {
    fabricRef.current!.dispose();
};
