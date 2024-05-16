import type {
    IObjectOptions as FabricObjectOptions,
    Object as FabricObject,
    IPathOptions as FabricPathOptions,
    Path as FabricPath,
    IObservable as FabricIObservable,
} from "@types/fabric";

// export * from "@types/fabric";
declare module "@types/fabric" {
    namespace fabric {
        interface IObjectOptions
            extends FabricObjectOptions,
                CustomObjectOptions {}

        interface Object extends FabricObject, CustomObject {}
        interface Path extends FabricPath, FabricPathOptions {
            path: (string | number)[][];
        }
        interface IObservable<T> extends FabricIObservable<T> {
            // Testing
            on(
                eventName: EventName,
                handler: (e: IEvent<MouseEvent>, canvas: fabric.Canvas) => void
            ): T;

            on(
                eventName: string,
                handler: (e: IEvent, canvas: fabric.Canvas) => void
            ): T;
        }
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
