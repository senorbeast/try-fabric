import {
    animationFrameS,
    animationRelativeProgressS,
    currentFrameS,
} from "./react-ridge";

const DisplayAnimationPanel = () => {
    const animationFrame = animationFrameS.useValue();
    const relProg = animationRelativeProgressS.useValue();
    const currentFrame = currentFrameS.useValue();
    return (
        <div className="flex gap-2 text-white">
            <li>AF: {animationFrame}</li>
            <li>RP: {relProg}</li>
            <li>CF: {currentFrame}</li>
        </div>
    );
};

export default DisplayAnimationPanel;
