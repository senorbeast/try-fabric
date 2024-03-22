const Button = ({ onClick, name }: { name: string; onClick: () => void }) => {
    return (
        <button
            className="flex px-4 p-2 rounded-full bg-white"
            type="button"
            onClick={onClick}
        >
            {name}
        </button>
    );
};

export default Button;
