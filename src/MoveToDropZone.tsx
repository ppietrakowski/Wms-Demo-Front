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

function ScanDropzone({ setContainerId, setStage, containerId, setMessage }: Props) {
    async function onSubmit(e: FormSubmitEvent) {
        const id = e.getString('dropzone')

        const response = await api.post('move-dropzone', {
            'container': containerId,
            'dropzone': id
        })

        setStage(0)
        setMessage({ message: `Moved ${containerId} to ${id}`, type: 'success' })
    }

    return <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
        <InputText type="text" submitElementKey='dropzone'>Scan Dropzone</InputText>
    </Form>
}


export function MoveToDropzone({ user }: AuthenticatedUserProps) {

    let [stage, setStage] = useState(0)
    let [containerId, setContainerId] = useState('')
    let [message, setMessage] = useState<InlineMessageSettings>({ type: '' })

    return <div>
        <ApplicationHeader header="Move to dropzone" user={user} displayOptionsMenu={true} operationStatus="primary">
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
        {(stage == 0) && <ScanContainerId setMessage={setMessage} setContainerId={setContainerId} setStage={setStage} containerId={containerId} />}
        {(stage == 1) && <ScanDropzone setMessage={setMessage} setContainerId={setContainerId} setStage={setStage} containerId={containerId} />}
    </div>
}