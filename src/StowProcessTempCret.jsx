import { useEffect, useRef, useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader.jsx";
import { Form } from "./Form.jsx";
import { InlineMessage } from "./InlineMessage.jsx";
import { api } from "./api.jsx";


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
        }} autoComplete="false">

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
        api.post('start-stow-session/', {
            containers: containers
        })
            .then(response => {
                setFormData({ ...formData, containers })
                setStage(STOW_SCAN_CONTAINER)
            })
    }

    return <ScanFormText onSubmit={dropzone => submit(dropzone)} outputName={'dropzone'} className={'w-100 p-1'}>
        <span className="d-flex justify-content-center fw-bold">Scan containers</span>
        {containers.length &&
            <span className="d-flex justify-content-center">Last scanned container:
                <span className="fw-bold ps-1">{containers[containers.length - 1]}</span></span>}
        <button className="btn btn-primary pt-3 pb-3" onClick={e => onScannedAllContainers()}>Scanned all containers</button>
    </ScanFormText>
}

function StowScanNextContainer({ setMessage, setFormData, formData, setStage }) {

    function onSubmit(container) {
        const code = container
        if (!formData.containers.includes(code)) {
            setMessage({ message: 'Invalid container or not added to session', type: 'error' })
            return;
        }

        setMessage({ message: `Selected container ${code}`, type: 'success' })
        setFormData({ ...formData, activeContainer: code })
        setStage(STOW_SCAN_ITEM)
    }

    return <ScanFormText onSubmit={container => onSubmit(container)} outputName={'container_tmp'}>
        Scan container
    </ScanFormText>
}

function TextAccentLastChars({ text, numChars = 4, className, boldClassName }) {
    const boldClass = ['fw-bold']

    if (boldClassName) {
        boldClass.push(boldClassName)
    }

    return <div className={className}>
        {text.substring(0, text.length - numChars)}
        <span className={boldClass.join(' ')}>{text.substring(text.length - numChars)}</span>
    </div>
}


function StowScanProduct({ setMessage, setFormData, formData, setStage }) {

    async function onSubmit(code) {

        if (code.startsWith('ts') || code.startsWith('cs')) {

            if (code == formData.activeContainer) {
                setMessage({ message: `Already selected container ${code}`, type: 'info' })
            }
            else {
                setMessage({ message: `Selected container ${code}`, type: 'success' })
            }

            setFormData({ ...formData, activeContainer: code })
            return;
        }

        api.post(`stow-get-product/`, {
            product_code: code,
            container: formData.activeContainer,
        })
            .then(response => {
                setFormData({ ...formData, productDetails: response.data['product'], code })
                setStage(STOW_SCAN_LOCATION)
            })
            .catch(e => {
            })
    }

    const { activeContainer } = formData
    return <div className='h-100'>
        <div className="position-absolute bottom-0 p-1 bg-dark text-white w-100">{activeContainer}</div>
        <ScanFormText outputName={'code'} onSubmit={code => onSubmit(code)}>
            Scan product or container
        </ScanFormText>
    </div>
}


function StowScanLocation({ setMessage, setFormData, formData, setStage }) {

    async function onSubmit(code) {
        if (code.startsWith('ts') || code.startsWith('cs')) {
            setMessage({ message: `Selected container ${code}`, type: 'success' })
            setFormData({ ...formData, activeContainer: code })
            setStage(3)
            return;
        }

        if (code.startsWith('bin')) {
            await api.post('stow-item', {
                container: formData.activeContainer,
                item: formData.productDetails.id,
                count: 1,
                target_bin: code
            })
            setMessage({ message: `Stowed item ${formData.code} in ${code}`, type: 'success' })
            setStage(STOW_SCAN_ITEM)
        }
    }

    const { activeContainer, productDetails } = formData
    useEffect(() => {
        if (productDetails.damaged) {
            setMessage({ message: 'Unsellable', type: 'warning' })
        } else {
            setMessage({})
        }
    }, [])


    return <div className='h-100'>
        <div className="d-flex justify-content-between">
            <div className="d-flex flex-column m-1">
                <TextAccentLastChars className={'badge bg-primary'} text={formData.code} boldClassName={'fs-6'} />
                <div>Weight: <span className="fw-bold">{productDetails.weight / 1000.0}</span> kg</div>
            </div>
            <div className="m-1">{productDetails.name}</div>
        </div>
        <div className="position-absolute bottom-0 p-1 bg-dark text-white w-100">{activeContainer}</div>
        <ScanFormText outputName={'code'} onSubmit={code => onSubmit(code)}>
            Scan location
        </ScanFormText>
    </div>
}


function ErrorScan({ setMessage, formData }) {
    useEffect(() => {
        setMessage({ message: 'Functionality not implemented', type: 'warning' })
    }, [])
    return <div className="position-absolute translate-middle start-50 top-50">
        Functionality not implemented
    </div>
}

const StagesComponents = [
    StowScanDropzone,
    StowScanContainers,
    StowScanNextContainer,
    StowScanProduct,
    StowScanLocation
]

export function StowProcessCretLike({ user }) {
    let [message, setMessage] = useState({ type: 'primary' })
    let [stage, setStage] = useState(STOW_SCAN_DROPZONE)
    let [formData, setFormData] = useState({})

    const Component = StagesComponents[stage] || ErrorScan

    return <div className="">
        <ApplicationHeader operationStatus={message.type} user={user} header={'Stow'} displayOptionsMenu={true}>
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}

        <Component user={user} message={message} formData={formData} setFormData={setFormData} setStage={setStage} stage={stage} setMessage={setMessage} />
    </div>
}