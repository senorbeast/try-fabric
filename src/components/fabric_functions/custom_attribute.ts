// import { fabric as fabricModule } from "fabric";
// import { customAttributes } from "./final_functions/constants";

// // Extend fabric.Object
// // Extend fabric.Object

// // Update fabric prototype
// const originalToObject = fabricModule.Object.prototype.toObject;
// const myAdditional = ["id", ...customAttributes];

// fabricModule.Object.prototype.toObject = function (additionalProperties) {
//     return originalToObject.call(
//         this,
//         myAdditional.concat(additionalProperties || "")
//     );
// };

// // Export fabric module
// export { fabricModule as fabric };
