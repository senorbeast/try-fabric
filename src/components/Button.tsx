const Button = ({
    onClick,
    name,
    className,
}: {
    name: string;
    onClick: () => void;
    className?: string;
}) => {
    return (
        <button
            className={`flex p-2 py-1 rounded-full bg-white ${className}`}
            type="button"
            onClick={onClick}
        >
            {name}
        </button>
    );
};

export default Button;
