import { useEffect, useRef, useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader.jsx";
import { Form } from "./Form.jsx";
import { InlineMessage } from "./InlineMessage.jsx";


const STOW_SCAN_DROPZONE = 0
const STOW_SCAN_CONTAINERS = 1
const STOW_SCAN_CONTAINER = 2
const STOW_SCAN_ITEM = 3
const STOW_SCAN_LOCATION = 4
const STOW_SCAN_MOVE_TO_DROPZONE_CONTAINERS = 5
const STOW_SCAN_MOVE_TO_DROPZONE_DROPZONE = 6


function restoreFocus(inputRef) {
    if (inputRef.current)
        inputRef.current.focus()
}

function ScanFormText({ outputName, onSubmit, children, className }) {
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

            // Wyczyść pole
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
        }}>

        </input>
    </div>
}

function StowScanDropzone({ user, setMessage, setStage, setFormData, formData, stage }) {
    function submit(dropzone) {
        if (dropzone.startsWith('dz-')) {
            setFormData({ ...formData, dropzone })
            setStage(STOW_SCAN_CONTAINERS)
            setMessage({ message: 'Selected dropzone !', type: 'success' })
        } else {
            setMessage({ message: 'Scan valid dropzone !', type: 'danger' })
        }
    }

    return <ScanFormText onSubmit={dropzone => submit(dropzone)} outputName={'dropzone'}>
        Scan dropzone to start stowing
    </ScanFormText>
}

function StowScanContainers({ message, setMessage, setStage, setFormData, formData }) {
    const [containers, setContainers] = useState([])

    function submit(container) {
        if (container.startsWith('ts') || container.startsWith('cs')) {
            if (!containers.some(c => c == container)) {
                setContainers(containers.concat([container]))
            }

            if (message.type == 'danger') {
                setMessage({})
            }
        } else {
            setMessage({ message: 'Scanned invalid code !', type: 'danger' })
        }
    }

    function onScannedAllContainers() {
        setFormData({ ...formData, containers })
        setStage(STOW_SCAN_CONTAINER)
    }

    return <ScanFormText onSubmit={dropzone => submit(dropzone)} outputName={'dropzone'} className={'w-100 p-1'}>
        <span className="d-flex justify-content-center fw-bold">Scan containers</span>
        {containers.length && <span className="d-flex justify-content-center">Last scanned container {containers[containers.length - 1]}</span>}
        <button className="btn btn-primary pt-3 pb-3" onClick={e => onScannedAllContainers()}>Scanned all containers</button>
    </ScanFormText>
}

function ErrorScan({ setMessage, formData }) {
    useEffect(() => {
        setMessage({ message: 'Functionality not implemented', type: 'warning' })
    }, [])
    return <div className="position-absolute translate-middle start-50 top-50">Functionality not implemented</div>
}

const StagesComponents = [
    StowScanDropzone,
    StowScanContainers
]

export function StowProcessCretLike({ user }) {
    let [message, setMessage] = useState({ type: 'primary' })
    let [stage, setStage] = useState(STOW_SCAN_DROPZONE)
    let [formData, setFormData] = useState({})

    const Component = StagesComponents[stage] || ErrorScan

    return <div><ApplicationHeader operationStatus={message.type} user={user} header={'Stow'} displayOptionsMenu={true}>
    </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}

        <Component user={user} message={message} formData={formData} setFormData={setFormData} setStage={setStage} stage={stage} setMessage={setMessage} />
    </div>
}