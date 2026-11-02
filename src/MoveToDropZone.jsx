import React, { useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader.tsx";
import { Form, FormSubmitEvent } from "./Form.tsx";
import { AuthenticatedUserProps } from "./Login.tsx";
import InputText from "./InputText.tsx";
import { api } from "./Api.tsx";
import { InlineMessage, InlineMessageSettings } from "./InlineMessage.tsx";

interface Props {
    containerId: string
    setContainerId: React.Dispatch<React.SetStateAction<string>>
    setStage: React.Dispatch<React.SetStateAction<number>>
    setMessage: React.Dispatch<React.SetStateAction<InlineMessageSettings>>
}

function ScanContainerId({ setContainerId, setStage }: Props) {
    function onSubmit(e: FormSubmitEvent) {
        setContainerId(e.getString('container_id'))
        setStage(1)
    }

    return <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
        <InputText maxLength={12} type="text" submitElementKey='container_id'>Scan Container Id</InputText>
    </Form>
}

function ScanDropzone({ setStage, formData, setMessage }) {
    async function onSubmit(e: FormSubmitEvent) {
        const id = e.getString('dropzone')

        const response = await api.post('move-dropzone', {
            'containers': formData.containers,
            'dropzone': id
        })

        setStage(0)
        setMessage({ message: `Moved containers to ${id}`, type: 'success' })
    }

    return <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
        <InputText type="text" submitElementKey='dropzone'>Scan Dropzone</InputText>
    </Form>
}


function ScanContainers({ setMessage, setFormData, formData, setStage }) {

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
        setFormData({ ...formData, containers })
        setStage(1)
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



export function MoveToDropzone({ user }: AuthenticatedUserProps) {

    let [stage, setStage] = useState(0)
    let [formData, setFormData] = useState({})
    let [message, setMessage] = useState<InlineMessageSettings>({ type: '' })

    return <div>
        <ApplicationHeader header="Move to dropzone" user={user} displayOptionsMenu={true} operationStatus="primary">
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
        {(stage == 0) && <ScanContainers setMessage={setMessage} setFormData={formData} setStage={setStage} setFormData={setFormData} />}
        {(stage == 1) && <ScanDropzone setMessage={setMessage} formData={formData} setStage={setStage} />}
    </div>
}