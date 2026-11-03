import React, { useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader.jsx";
import { Form } from "./Form.jsx";
import InputText from "./InputText.jsx";
import { api } from "./api.jsx";
import { InlineMessage } from "./InlineMessage.jsx";
import ScanContainers from "./ScanContainers.jsx";

function MVDScanContainers({ formData, setStage, setFormData, setMessage }) {
    return <ScanContainers setMessage={setMessage} onFinishedScanning={containers => {
        setFormData({ ...formData, containers })
        setStage(1)
    }} />
}

function ScanDropzone({ setStage, formData, setMessage }) {
    async function onSubmit(e) {
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

export function MoveToDropzone({ user }) {

    let [stage, setStage] = useState(0)
    let [formData, setFormData] = useState({})
    let [message, setMessage] = useState({ type: '' })

    return <div>
        <ApplicationHeader header="Move to dropzone" user={user} displayOptionsMenu={true} operationStatus="primary">
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
        {(stage == 0) && <MVDScanContainers setMessage={setMessage} setFormData={setFormData} formData={formData} setStage={setStage} />}
        {(stage == 1) && <ScanDropzone setMessage={setMessage} setFormData={setFormData} formData={formData} setStage={setStage} />}
    </div>
}