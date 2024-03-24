const Button = ({ onClick, name }: { name: string; onClick: () => void }) => {
    return (
        <button
            className="flex p-2 py-1 rounded-full bg-white"
            type="button"
            onClick={onClick}
        >
            {name}
        </button>
    );
};

export default Button;
