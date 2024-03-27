export { getReqObjByIds };

function getReqObjByIds(canvas: fabric.Canvas, ids: string[]) {
    const result: (fabric.Object | null)[] = [];

    ids.forEach((id, index) => {
        canvas.getObjects().forEach((obj) => {
            if (id == obj.name) {
                result.push(obj);
            }
        });
        if (result.length == index) result.push(null);
    });

    return result;
}
