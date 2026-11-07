import { useEffect, useRef, useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader.jsx";
import { Form } from "./Form.jsx";
import { InlineMessage } from "./InlineMessage.jsx";
import { api } from "./api.jsx";
import { Link } from "react-router-dom";
import ScanFormText from "./ScanFormText.jsx";
import TextAccentLastChars from "./TextAccentLastChars.jsx";
import ShowModal from "./ShowModal.jsx";
import { ActiveContainerAddOn } from "./ActiveContainerAddOn.jsx";

const STOW_SCAN_DROPZONE = 0
const STOW_SCAN_CONTAINERS = 1
const STOW_SCAN_CONTAINER = 2
const STOW_SCAN_ITEM = 3
const STOW_SCAN_LOCATION = 4
const STOW_MOVE_CONTAINERS = 5
const STOW_MOVE_CONTAINERS_DROPZONE = 6
const STOW_MOVE_CONTAINERS_ENDSESSION = 7
const STOW_MOVE_CONTAINERS_SHOWOVERFLOW = 8

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
        <span className="d-flex justify-content-center">Num scanned containers: {containers.length}</span>
        {!!containers.length &&
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
                setMessage({ message: 'Overflow detected !', type: 'error' })
                setStage(STOW_MOVE_CONTAINERS_SHOWOVERFLOW)
            })
    }

    const { activeContainer } = formData
    return <div className='h-100'>
        <ActiveContainerAddOn container={activeContainer} />
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
        else if (code.startsWith('bin')) {

            api.post('stow-item/', {
                container: formData.activeContainer,
                item: formData.productDetails.id,
                count: 1,
                target_bin: code
            }).then(response => {
                setMessage({ message: `Stowed item ${formData.code} in ${code}`, type: 'success' })
                setStage(STOW_SCAN_ITEM)
            })
                .catch(e => {
                    setMessage({ message: e.response.data['reason'], type: 'error' })
                })
        }
        else {
            setMessage({ message: 'Invalid code. Please scan location or container', type: 'error' })
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
        <ActiveContainerAddOn container={activeContainer} />
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


function StowMoveContainers({ setMessage, setFormData, formData, setStage, message, stage }) {
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
                formData.finishStowing = stage == STOW_MOVE_CONTAINERS_ENDSESSION
                setFormData({ ...formData, dropContainers: containers })
                setStage(STOW_MOVE_CONTAINERS_DROPZONE)
            })
    }

    return <ScanFormText onSubmit={dropzone => submit(dropzone)} outputName={'dropzone'} className={'w-100 p-1'}>
        <span className="d-flex justify-content-center fw-bold">Scan containers</span>
        <span className="d-flex justify-content-center">Scanned {containers.length} containers</span>
        <button className="btn btn-primary pt-3 pb-3" onClick={e => onScannedAllContainers()}>Scanned all containers</button>
        <button className="btn btn-secondary pt-3 pb-3" onClick={e => setStage(STOW_SCAN_CONTAINER)}>Cancel</button>
    </ScanFormText>
}

function sendEndStowSessionRequest(setStage, setFormData, setMessage) {
    api.post('end-stow-session/')
        .then(response => {
            setFormData({})
            setMessage({ message: 'Finished stowing !', type: 'success' })
            setStage(STOW_SCAN_DROPZONE)
        })
        .catch(e => {
            setMessage({ message: e.response.data['reason'], type: 'error' })
        })
}

function StowMoveContainersScanDropzone({ user, setMessage, setStage, setFormData, formData, stage }) {
    async function submit(dropzone) {
        const data = await api.post('stow-move-containers/', {
            'containers': formData.dropContainers,
            'dropzone': dropzone
        })
        const containers = formData.containers.filter(e => !formData.dropContainers.some(v => e == v))

        setFormData({ ...formData, containers })

        setMessage({ message: `Dropped containers`, type: 'success' })

        if (formData.finishStowing) {
            sendEndStowSessionRequest(setStage, setFormData, setMessage)
            return;
        }

        if (containers.length == 0) {
            setFormData({})
            setStage(STOW_SCAN_DROPZONE)
        } else {
            setStage(STOW_SCAN_CONTAINER)
        }
    }


    return <ScanFormText onSubmit={dropzone => submit(dropzone)} outputName={'dropzone'}>
        Scan dropzone
    </ScanFormText>
}

function StowShowOverflow({ user, setMessage, setStage, setFormData, formData, stage }) {
    function returnToStow() {
        setMessage({})
        setStage(STOW_SCAN_ITEM)
    }
    return <div className="translate-middle top-50 start-50 position-absolute d-flex flex-column">
        <div>
            Overflow detected. Please give container {formData.activeContainer} to Problem Solver.
        </div>
        <button className="btn btn-primary" onClick={e => returnToStow()}>Ok</button>
    </div>

}

const StagesComponents = [
    StowScanDropzone,
    StowScanContainers,
    StowScanNextContainer,
    StowScanProduct,
    StowScanLocation,
    StowMoveContainers,
    StowMoveContainersScanDropzone,
    StowMoveContainers,
    StowShowOverflow
]

export function Stow({ user }) {
    let [message, setMessage] = useState({ type: 'primary' })
    let [stage, setStage] = useState(STOW_SCAN_DROPZONE)
    let [formData, setFormData] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.post('get-stow-session/')
            .then(v => {
                const containers = v.data['containers']
                setFormData({ ...formData, containers, continue: true })
                if (containers.length > 0) {
                    setStage(STOW_SCAN_CONTAINER)
                }

                setLoading(false)
            })
    }, [])

    if (loading) {

        return <div className='position-absolute translate-middle top-50 start-50 justify-content-center align-items-center d-flex'>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    }

    const Component = StagesComponents[stage] || ErrorScan

    return <div className="">
        <ApplicationHeader operationStatus={message.type} user={user} header={'Stow'} displayOptionsMenu={true}>
            {
                stage <= STOW_SCAN_CONTAINER ?
                    (<div></div>) :
                    (
                        <div>
                            <button className="dropdown-item" data-bs-toggle="modal" data-bs-target="#end-stow-session">End stow session</button>
                            <button className="dropdown-item" onClick={e => setStage(STOW_MOVE_CONTAINERS)}>Move containers</button>
                        </div>
                    )
            }

        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
        <Component user={user} message={message} formData={formData} setFormData={setFormData} setStage={setStage} stage={stage} setMessage={setMessage} />
        <ShowModal id={'end-stow-session'} title={'End stow session'} buttons={
            [<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>,
            <div className="d-flex">
                <button type="button" class="btn btn-primary m-1" onClick={e => sendEndStowSessionRequest(setStage, setFormData, setMessage)} data-bs-dismiss="modal">Yes</button>
                <button type="button" class="btn btn-primary m-1" onClick={e => setStage(STOW_MOVE_CONTAINERS_ENDSESSION)} data-bs-dismiss="modal">No</button>
            </div>
            ]}>
            Are all containers empty ?
        </ShowModal>
    </div>
}