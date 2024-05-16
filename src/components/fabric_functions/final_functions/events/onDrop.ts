import { fabric } from "fabric";
import { createStaticObject } from "../staticObject/staticObject";

export function onDrop(e: fabric.IEvent<MouseEvent>, canvas: fabric.Canvas) {
    const dragEvent: DragEvent = e.e as DragEvent;
    const { getImageElementId, x, y } = prepareDataFromDragDropEvent(dragEvent);
    createStaticObject(canvas, getImageElementId, x, y);
}

function prepareDataFromDragDropEvent(dragEvent: DragEvent) {
    // Read data from DragEvent

    const getImageElementId = dragEvent.dataTransfer!.getData("id");
    const mouseOffsetX = parseInt(
        dragEvent.dataTransfer!.getData("mouseOffsetX")
    );
    const mouseOffsetY = parseInt(
        dragEvent.dataTransfer!.getData("mouseOffsetY")
    );

    // Fix mouse to img element relative offset
    const x = dragEvent.layerX - mouseOffsetX;
    const y = dragEvent.layerY - mouseOffsetY;
    return { getImageElementId, x, y };
}
