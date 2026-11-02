
export function FormButton({ className, type, children }) {
    return <div className={className || "row g-2 mt-5"}>
        <button type={type}
            className="btn btn-primary w-100 py-3 mt-1 fw-bold translate-middle position-relative top-0 start-50">
            {children}
        </button>
    </div>
}