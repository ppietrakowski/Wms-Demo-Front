import { useEffect, useRef, useState } from "react"
import { ApplicationHeader } from "./ApplicationHeader.tsx"
import { InlineMessage, InlineMessageSettings } from "./InlineMessage.tsx"
import { AuthenticatedUserProps } from "./Login.tsx"
import { Form, FormSubmitEvent } from "./Form.tsx"
import InputText from "./InputText.tsx"
import { api } from "./Api.tsx"

export function StowScanDropzone({ setMessage, setFormData, formData, setStage }) {
    async function onSubmit(params: FormSubmitEvent) {
        setFormData({ ...formData, dropzone: params.getString('dropzone') })
        setStage(1)
        setMessage({ message: `Scanned drozpone`, type: 'success' })
    }

    return <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
        <InputText className="hidden" type="text" maxLength={12}>
            Scan Dropzone
        </InputText>
    </Form>
}

function StowScanContainers({ setMessage, setFormData, formData, setStage }) {
    async function onSubmit() {
        setStage(1)
        setMessage({ message: `Scanned drozpone`, type: 'success' })
    }

    const [containers, setContainers] = useState([]);
    const [inputValue, setInputValue] = useState('');

    // Automatyczne ustawienie fokusu na polu przy starcie

    const handleAddContainer = (e) => {
        e.preventDefault();
        const code = inputValue.trim();

        if (code !== '') {
            if (!code.startsWith('cs') && !code.startsWith('ts')) {
                setMessage({ message: 'Zeskanuj prawidłowy typ pojemnika', type: 'danger' })
                return;
            }

            if (!containers.includes(code)) {
                setContainers((prev) => [code, ...prev]);
            }
            setInputValue('');
        }
    };

    async function submitContainers() {
        const response = await api.post('start-stow-session/', {
            containers: containers
        })

        console.log(`session_containe`)

        setFormData({ ...formData, containers })
        setStage(2)
    }

    return (
        <div className="card shadow-sm border-0 mh-100 h-25">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0 fs-6">
                    <i className="bi bi-upc-scan me-2"></i>
                </h5>
                <span className="badge bg-primary rounded-pill">
                    {containers.length} {containers.length === 1 ? 'pozycja' : 'pozycji'}
                </span>
            </div>
            <div className="card-body bg-gray-500 border-bottom p-3">
                <form onSubmit={handleAddContainer}>
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-gray-500 border-end-0 text-muted">
                            📦
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-2 shadow-none"
                            placeholder="Zeskanuj lub wpisz kod pojemnika..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoComplete="off"
                            maxLength={12}
                        />
                        <button className="btn btn-primary px-4" type="submit">
                            Dodaj
                        </button>
                    </div>
                    <div className="form-text mt-2 text-muted small">
                        Wpisz kod lub użyj skanera i wciśnij <kbd>Enter</kbd>
                    </div>
                </form>
            </div>

            {/* PRZEWIJANA LISTA Z KONTROLĄ WYSOKOŚCI */}
            <div
                className="card-body overflow-y-auto mh-100 h-25 p-3">
                {containers.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <p className="mb-1">Brak zeskanowanych pojemników</p>
                        <small>Zeskanuj pierwszy element, aby rozpocząć listę.</small>
                    </div>
                ) : (
                    <ul className="list-group list-group-flush shadow-sm rounded">
                        {containers.map((item, index) => (
                            <li
                                key={index}
                                className="list-group-item d-flex justify-content-between align-items-center py-2 px-3"
                            >
                                <div className="d-flex align-items-center">
                                    <span className="badge bg-secondary text-light me-3 font-monospace">
                                        {containers.length - index}
                                    </span>
                                    <span className="fw-medium text-white">{item}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* STOPKA */}
            <button className="btn btn-primary text-center text-end small py-2 rounded-0 " onClick={e => submitContainers()}>
                Zeskanowano wszystkie pojemniki
            </button>

        </div>
    );
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
        setStage(3)
    }

    return <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
        <InputText className="hidden" type="text" submitElementKey="container" maxLength={12}>
            Scan Container {formData.continue && <span> to continue stow</span>}
        </InputText>
    </Form>
}

function StowScanProduct({ setMessage, setFormData, formData, setStage }) {

    async function onSubmit(params: FormSubmitEvent) {
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
                setStage(4)
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

    async function onSubmit(params: FormSubmitEvent) {
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
                Zeskanuj product xDDD
            </div>
            <div className="w-100 bg-dark mt-2" style={{ padding: '1px' }}></div>
        </div>
        <Form positionedAtCentered={false} submitCallback={e => onSubmit(e)}>
            <InputText className="hidden" type="text" submitElementKey="location" maxLength={12}>
                Scan Location (Or container)
            </InputText>
        </Form>
    </div>
}

export function Stow({ user }: AuthenticatedUserProps) {
    let [message, setMessage] = useState<InlineMessageSettings>({ type: '' })
    let [stage, setStage] = useState(0)
    let [formData, setFormData] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.post('get-stow-session/')
            .then(v => {
                const containers = v.data['containers']
                setFormData({ ...formData, containers, continue: true })
                if (containers.length > 0) {
                    setStage(2)
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