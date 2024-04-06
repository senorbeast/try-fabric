import { fabric } from "fabric";
import { customAttributes } from "./frame_object";

const originalToObject = fabric.Object.prototype.toObject;
const myAdditional = ["id", ...customAttributes];

fabric.Object.prototype.toObject = function (additionalProperties) {
    return originalToObject.call(
        this,
        myAdditional.concat(additionalProperties || "")
    );
};

const descriptor = Object.getOwnPropertyDescriptor(
    fabric.Object.prototype,
    "toObject"
);
console.log("Object writable ?", descriptor.writable); // false

// fabric.Object.prototype.toObject = (function (toObject) {
//     return function () {
//         return fabric.util.object.extend(toObject.call(this), {
//             id: this.id,
//         });
//     };
// })(fabric.Object.toObject);

// fabric.Object.prototype.toObject = (function (toObject) {
//     return function () {
//         return fabric.util.object.extend(toObject.call(this), {
//             name: this.name,
//         });
//     };
// })(rect.toObject);

export default fabric;
