import { useEffect, useRef } from "react";

function restoreFocus(inputRef) {
    if (inputRef.current) {
        inputRef.current.focus()
    }
}

export default function ScanFormText({ outputName, onSubmit, children, className }) {
    const inputRef = useRef(null);

    useEffect(() => {
        restoreFocus(inputRef)

        const handleDocumentClick = () => {
            restoreFocus(inputRef)
        }

        document.addEventListener('click', handleDocumentClick)

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        }
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const code = e.target.value.trim();

            if (code) {
                onSubmit(code)
            }

            e.target.value = '';
        }
    };

    const classes = ['position-absolute top-50 start-50 translate-middle d-flex flex-column justify-content-between']

    if (className) {
        classes.push(className)
    }

    return <div className={classes.join(' ')}>
        {children}
        <input ref={inputRef} name={outputName} autoFocus={true} onKeyDown={e => handleKeyDown(e)} style={{
            position: 'absolute',
            left: '-9999px',
            opacity: 0,
            pointerEvents: 'none',
        }} autoComplete="false">

        </input>
    </div>
}
