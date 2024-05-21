export type PointType = [number, number];
export type PathType = (string | number)[][];

// Final JSON to be saved in backend for frames
export type framesDataType = {
    fOIds: string[];
    frames: canvasJSONType[];
};

export type canvasJSONType = {
    version: string;
    objects: fabric.Object[];
};
