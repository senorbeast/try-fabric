import { fabric } from "fabric";
import { fabricRefType } from "./Canvas";

export class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `${this.x} ${this.y}`;
    }
}

interface CubicBezierOptions {
    start?: Vec2;
    end?: Vec2;
    c1?: Vec2;
    c2?: Vec2;
}

class CubicBezier {
    private start: Vec2;
    private end: Vec2;
    private c1: Vec2;
    private c2: Vec2;
    private curve: fabric.Path;
    private controlCurve: fabric.Path;

    constructor(fabricRef: fabricRefType, opts: CubicBezierOptions = {}) {
        const canvas = fabricRef.current!;
        this.start = opts.start || new Vec2(100, 100);
        this.end = opts.end || new Vec2(400, 400);
        this.c1 = opts.c1 || new Vec2(100, 300);
        this.c2 = opts.c2 || new Vec2(300, 100);
        this.curve = new fabric.Path(this.toSVGPath());
        this.controlCurve = new fabric.Path(this.toControlPath());
        this.curve.selectable = this.controlCurve.selectable = false;
        this.curve.fill = this.controlCurve.fill = "none";
        this.curve.stroke = "black";
        this.controlCurve.stroke = "black";
        canvas.calcOffset();
        this.renderControlPoints(canvas);
        this.renderCurve(canvas);
        canvas.add(this.curve);
        canvas.renderAll();
    }

    private toSVGPath(): string {
        let str = `M${this.start.toString()}`;
        str += `C${this.c1.toString()}`;
        str += `${this.c2.toString()}`;
        str += `${this.end.toString()}`;
        return str;
    }

    private toControlPath(): string {
        let str = `M${this.start.toString()}`;
        str += `L${this.c1.toString()}`;
        str += `L${this.c2.toString()}`;
        str += `L${this.end.toString()}`;
        return str;
    }

    private renderControlPoints(canvas: {
        add: (arg0: fabric.Circle) => void;
    }) {
        const r = 10;
        const points = [
            new fabric.Circle({
                top: this.start.y,
                left: this.start.x,
                radius: r,
                as: "start",
            }),
            new fabric.Circle({
                top: this.end.y,
                left: this.end.x,
                radius: r,
                as: "end",
            }),
            new fabric.Circle({
                top: this.c1.y,
                left: this.c1.x,
                radius: r,
                as: "c1",
            }),
            new fabric.Circle({
                top: this.c2.y,
                left: this.c2.x,
                radius: r,
                as: "c2",
            }),
        ];

        points.forEach((p) => {
            p.fill = "#f55";
            p.stroke = "#2B436E";
            p.hasControls = p.hasBorder = false;
            p.belongsTo = this;
            canvas.add(p);
        });
    }

    private renderCurve(canvas: fabric.Canvas) {
        const dummyPath = new fabric.Path(this.toSVGPath());
        this.curve.path = dummyPath.path;
        const dummyPath2 = new fabric.Path(this.toControlPath());
        this.controlCurve.path = dummyPath2.path;
    }
}

export default CubicBezier;
