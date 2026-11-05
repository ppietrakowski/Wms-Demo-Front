import React, { useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader.jsx";
import { api } from "./api.jsx";
import { InlineMessage } from "./InlineMessage.jsx";
import ScanFormText from "./ScanFormText.jsx";

function MVDScanContainers({ formData, setStage, setFormData, setMessage, message }) {
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

    function onScannedAllContainers(setFormData, formData, containers, setStage) {
        setFormData({ ...formData, containers })
        setStage(1)
    }

    return <ScanFormText onSubmit={dropzone => submit(dropzone)} outputName={'dropzone'} className={'w-100 p-1'}>
        <span className="d-flex justify-content-center fw-bold">Scan containers</span>
        {!!containers.length &&
            <span className="d-flex justify-content-center">Last scanned container:
                <span className="fw-bold ps-1">{containers[containers.length - 1]}</span></span>}
        <button className="btn btn-primary pt-3 pb-3" onClick={e => onScannedAllContainers(setFormData, formData, containers, setStage)}>Scanned all containers</button>
    </ScanFormText>
}

function ScanDropzone({ setStage, formData, setMessage }) {
    async function submit(dropzone) {
        await api.post('move-dropzone/', {
            'containers': formData.containers,
            'dropzone': dropzone
        })

        setStage(0)
        setMessage({ message: `Moved containers to ${dropzone}`, type: 'success' })
    }


    return <ScanFormText onSubmit={dropzone => submit(dropzone)} outputName={'dropzone'} className={'w-100 p-1'}>
        <span className="d-flex justify-content-center fw-bold">Scan dropzone</span>
    </ScanFormText>
}

const Stages = [
    MVDScanContainers,
    ScanDropzone
]

export function MoveToDropzone({ user }) {
    const [stage, setStage] = useState(0)
    const [formData, setFormData] = useState({})
    const [message, setMessage] = useState({ type: '' })
    const Component = Stages[stage]

    return <div>
        <ApplicationHeader header="Move to dropzone" user={user} displayOptionsMenu={true} operationStatus="primary">
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
        <Component message={message} setMessage={setMessage} setFormData={setFormData} formData={formData} setStage={setStage} />
    </div>
}