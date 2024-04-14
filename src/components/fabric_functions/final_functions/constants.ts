export const endPointOffset = 16;
export const controlPointOffset = 8;

export const unMovableOptions: fabric.IObjectOptions = {
    evented: false,
    selectable: false,
    lockMovementX: true,
    lockMovementY: true,
    hasControls: false,
    hasBorders: false,
};

export const customAttributes = [
    "commonID",
    "initialFrame",
    "currentType",
    "currentFrame",
    "fOIds",
];

export const extraProps = [
    "name",
    "line1",
    "line2",
    "line3",
    "line4",
    "objectCaching",
    "path",
    "height",
    "width",
    ...customAttributes,
    ...Object.keys(unMovableOptions),
];
