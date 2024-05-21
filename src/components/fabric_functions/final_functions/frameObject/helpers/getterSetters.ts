export { getReqObjBy, getReqObjByNames, getReqObjByNamesForID }; // getters
export { setObjsOptions }; //setters

function getReqObjByNames(
    canvas: fabric.Canvas,
    ids: string[],
    objects?: fabric.Object[]
) {
    const result: (fabric.Object | null)[] = [];
    const filterObjects = objects ?? canvas.getObjects();

    ids.forEach((id, index) => {
        filterObjects.forEach((obj) => {
            if (id == obj.name) {
                result.push(obj);
            }
        });
        if (result.length == index) result.push(null);
    });
    return result;
}

function getReqObjByNamesForID(
    canvas: fabric.Canvas,
    commonID: string,
    names: string[],
    objects?: fabric.Object[]
) {
    const result: (fabric.Object | null)[] = [];
    const filterObjects = objects ?? canvas.getObjects();

    names.forEach((name, index) => {
        filterObjects.forEach((obj) => {
            if (name == obj.name && commonID == obj.commonID) {
                result.push(obj);
            }
        });
        if (result.length == index) result.push(null);
    });
    return result;
}

function getReqObjBy(
    canvas: fabric.Canvas,
    key: keyof fabric.Object,
    value: string
): (fabric.Object | null)[] {
    const result: (fabric.Object | null)[] = [];
    canvas.getObjects().forEach((obj) => {
        if (value == obj[key]) {
            result.push(obj);
        }
    });
    return result;
}

type ObjectList = (fabric.Object | null)[];

export function getReqObjGroups(
    canvas: fabric.Canvas
): Record<string, ObjectList> {
    const objCollection: Record<string, ObjectList> = {};
    canvas.getObjects().forEach((obj) => {
        if (obj["commonID"]) {
            if (!objCollection[obj["commonID"]]) {
                objCollection[obj["commonID"]] = [];
            }
            objCollection[obj["commonID"]].push(obj);
        }
    });
    return objCollection;
}

function setObjsOptions(
    objects: fabric.Object[],
    options: fabric.IObjectOptions
) {
    objects.forEach((obj) => {
        obj.set(options);
    });
}
