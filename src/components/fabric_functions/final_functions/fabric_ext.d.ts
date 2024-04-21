import {
    IObjectOptions as FabricObjectOptions,
    Object as FabricObject,
} from "@types/fabric";

declare module "@types/fabric" {
    namespace fabric {
        interface IObjectOptions
            extends FabricObjectOptions,
                CustomObjectOptions {}
        interface Object
            extends FabricObject,
                CustomObjectOptions,
                CustomObject {}
    }
}

// Define custom attributes type
type CustomObjectOptions = {
    id?: string;
    fOIds?: string[];
    commonID?: string;
    initialFrame?: number;
    currentType?: "point" | "line" | "curve";
    currentFrame?: number;
};

type CustomObject = {
    line1?: fabric.Path | null;
    line2?: fabric.Path | null;
    line3?: fabric.Path | null;
    line4?: fabric.Path | null;
};
