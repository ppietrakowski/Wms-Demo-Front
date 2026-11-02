import { useEffect, useRef, useState } from "react"
import { ApplicationHeader } from "./ApplicationHeader.jsx"
import { InlineMessage } from "./InlineMessage.jsx"
import { Form } from "./Form.jsx"
import InputText from "./InputText.jsx"
import { api } from "./api.jsx"
import ScanContainers from "./ScanContainers.jsx"

const STOW_SCAN_DROPZONE = 0
const STOW_SCAN_CONTAINERS = 1
const STOW_SCAN_CONTAINER = 2
const STOW_SCAN_ITEM = 3
const STOW_SCAN_LOCATION = 4

export function StowScanDropzone({ setMessage, setFormData, formData, setStage }) {
    async function onSubmit(params) {
        setFormData({ ...formData, dropzone: params.getString('dropzone') })
        setStage(STOW_SCAN_CONTAINERS)
        setMessage({ message: `Scanned drozpone`, type: 'success' })
    }

    return <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
        <InputText className="hidden" type="text" maxLength={12}>
            Scan Dropzone
        </InputText>
    </Form>
}

function StowScanContainers({ setMessage, setFormData, formData, setStage }) {
    function submitContainers(containers) {
        api.post('start-stow-session/', {
            containers: containers
        })
            .then(response => {
                setFormData({ ...formData, containers })
                setStage(STOW_SCAN_CONTAINER)
            })
    }

    return <ScanContainers onFinishedScanning={containers => submitContainers(containers)} setMessage={(setMessage)} />
}

function StowScanNextContainer({ setMessage, setFormData, formData, setStage }) {

    function onSubmit(e) {
        const code = e.getString('container')
        if (!formData.containers.includes(code)) {
            setMessage({ message: 'Invalid container or not added to session', type: 'error' })
            return;
        }

        setMessage({ message: `Selected container ${code}`, type: 'success' })
        setFormData({ ...formData, activeContainer: code })
        setStage(STOW_SCAN_ITEM)
    }

    return <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
        <InputText className="hidden" type="text" submitElementKey="container" maxLength={12}>
            Scan Container {formData.continue && <span> to continue stow</span>}
        </InputText>
    </Form>
}

function StowScanProduct({ setMessage, setFormData, formData, setStage }) {

    async function onSubmit(params) {
        const code = params.getString('code')

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
                setFormData({ ...formData, productDetails: response.data['product'] })
                setStage(STOW_SCAN_LOCATION)
            })
            .catch(e => {
            })
    }

    return <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
        <InputText className="hidden" type="text" submitElementKey="code" maxLength={12}>
            Scan Product Or Container
        </InputText>
    </Form>
}

function StowScanLocation({ setMessage, setFormData, formData, setStage }) {

    async function onSubmit(params) {
        const code = params.getString('location')

        if (code.startsWith('ts') || code.startsWith('cs')) {
            setMessage({ message: `Selected container ${code}`, type: 'success' })
            setFormData({ ...formData, activeContainer: code })
            setStage(3)
            return;
        }


    }

    return <div>
        <div className="d-flex flex-column justify-content-center align-items-center w-100 ">
            <div className="p-2">
                <Form positionedAtCentered={false} submitCallback={e => onSubmit(e)}>
                    <InputText className="hidden" type="text" submitElementKey="location" maxLength={12}>
                        Scan Location (Or container)
                    </InputText>
                </Form>
            </div>
            <div className="w-100 bg-dark mt-2" style={{ padding: '1px' }}></div>
            <div className="d-flex justify-content-between align-items-center w-100">
                <div className="p-2 text-muted ms-3">THERE WILL BE IMAGE</div>
                <div className="d-flex flex-column me-3">
                    <div className="p-2 border border-2 border-dark fs-3">{formData.productDetails.id}</div>
                    <div className="p-2 fs-6 text-primary">{formData.productDetails.weight / 1000.0} kg</div>
                    <div className="p-2 fs-6 fw-bold">{formData.productDetails.name}</div>
                </div>
            </div>
        </div>

    </div>
}

export function Stow({ user }) {
    let [message, setMessage] = useState({ type: '' })
    let [stage, setStage] = useState(0)
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

    return <div className="d-flex flex-column h-100">
        <ApplicationHeader header="Stow" user={user} displayOptionsMenu={true} operationStatus="primary">
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
        {stage == 0 && <StowScanDropzone setStage={setStage} formData={formData} setFormData={setFormData} setMessage={setMessage} />}
        {stage == 1 && <StowScanContainers setStage={setStage} formData={formData} setFormData={setFormData} setMessage={setMessage} />}
        {stage == 2 && <StowScanNextContainer setStage={setStage} formData={formData} setFormData={setFormData} setMessage={setMessage} />}
        {stage == 3 && <StowScanProduct setStage={setStage} formData={formData} setFormData={setFormData} setMessage={setMessage} />}
        {stage == 4 && <StowScanLocation setStage={setStage} formData={formData} setFormData={setFormData} setMessage={setMessage} />}

        {formData.activeContainer && <footer className="footer bg-secondary-subtle ps-2 p-1 w-100 position-absolute bottom-0">
            <span className="text-muted">{formData.activeContainer}</span>
        </footer>}
    </div>
}