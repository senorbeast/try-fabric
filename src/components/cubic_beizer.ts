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
        this.controlCurve.stroke = "blue";
        this.controlCurve.strokeDashArray = [5, 5];
        canvas.add(this.curve, this.controlCurve);
        canvas.renderAll();
        canvas.calcOffset();
    }

    private toSVGPath(): string {
        const startX = this.start.x;
        const startY = this.start.y;
        const endX = this.end.x;
        const endY = this.end.y;
        const c1X = this.c1.x;
        const c1Y = this.c1.y;
        const c2X = this.c2.x;
        const c2Y = this.c2.y;

        return `M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`;
    }

    private toControlPath(): string {
        let str = `M${this.start.toString()}`;
        str += `L${this.c1.toString()}`;
        str += `L${this.c2.toString()}`;
        str += `L${this.end.toString()}`;
        return str;
    }

    public renderControlPoints(canvas: fabric.Canvas) {
        const r = 10;
        const points = [
            {
                point: this.start,
                label: "start",
            },
            {
                point: this.end,
                label: "end",
            },
            {
                point: this.c1,
                label: "c1",
            },
            {
                point: this.c2,
                label: "c2",
            },
        ];

        points.forEach(({ point, label }) => {
            const circle = new fabric.Circle({
                top: point.y,
                left: point.x,
                radius: r,
                fill: "#f55",
                stroke: "#2B436E",
                hasControls: false,
                hasBorder: false,
                as: label,
            });
            circle.belongsTo = this;
            canvas.add(circle);
        });
    }

    public renderCurve(canvas: fabric.Canvas) {
        const dummyPath = new fabric.Path(this.toSVGPath());
        this.curve.path = dummyPath.path;
        canvas.renderAll();
    }
}

export default CubicBezier;
