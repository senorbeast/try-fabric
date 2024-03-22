import Canvas from "./components/Canvas";

function App() {
    return (
        <div className="bg-slate-950 flex-col w-screen h-screen">
            <h1 className="flex justify-center text-2xl text-white">
                Fabricjs - React
            </h1>
            <div className="flex ">
                <Canvas />
            </div>
        </div>
    );
}

export default App;
