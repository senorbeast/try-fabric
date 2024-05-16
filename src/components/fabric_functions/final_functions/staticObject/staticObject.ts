import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

export function createStaticObject(
    canvas: fabric.Canvas,
    imageId: string,
    x: number,
    y: number
) {
    const imgE = document.getElementById(imageId) as HTMLImageElement;

    const imgObj = new fabric.Image(imgE, {});

    const newCommonID: string = uuidv4();
    const groupObj = new fabric.Group([imgObj], {
        left: x, // Fix mouse offset
        top: y,
        commonID: newCommonID,
        name: "groupObj",
    });

    const textObj = new fabric.Text("hi", {
        fontFamily: "Helvetica",
        fill: "#fff",
        originX: "center",
        textAlign: "center",
        fontSize: 15,
        top: -35,
        name: "textName",
    });

    const textObj2 = new fabric.Text("", {
        fontFamily: "Helvetica",
        fill: "#fff",
        originX: "center",
        textAlign: "center",
        fontSize: 10,
        top: -48,
        name: "textTag",
    });

    // imgObj.scaleToWidth(imgE.width); //scaling the image height and width with target height and width, scaleToWidth, scaleToHeight fabric inbuilt function.
    // imgObj.scaleToHeight(imgE.height);

    groupObj.add(textObj);
    groupObj.add(textObj2);

    canvas.add(groupObj);
    canvas.renderAll();
}
