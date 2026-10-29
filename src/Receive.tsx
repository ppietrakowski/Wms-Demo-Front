import { CSSProperties, ReactNode, use, useEffect, useState } from 'react';
import * as ReactRouter from 'react-router-dom'
import { ApplicationHeader } from './ApplicationHeader.tsx';
import { InlineMessage, InlineMessageSettings } from './InlineMessage.tsx';
import { Form } from './Form.tsx';
import InputText from './InputText.tsx';
import { User } from './MainMenu.tsx';
import { AuthenticatedUserProps } from './Login.tsx';

enum ReceiveStage {
    SCAN_SHIP_ID = 0,
    SCAN_ITEM_ID,
    SCAN_TOTE_ID,
    SCAN_PROBLEM_CODE,
    SCAN_PROBLEM_TOTE,
}

interface ReceiveProps extends AuthenticatedUserProps {
    setStage: React.Dispatch<React.SetStateAction<ReceiveStage>>
}

function ReceiveScanID({ user, setStage }: ReceiveProps) {
    let [message, setMessage] = useState<InlineMessageSettings>({ type: 'danger' })

    return <div><ApplicationHeader header='Receive' operationStatus='primary' displayOptionsMenu={true} />
        {message.message && <InlineMessage message={message.message} type={message.type} />}
        <Form positionedAtCentered={true} submitCallback={() => setStage(ReceiveStage.SCAN_ITEM_ID)}>
            <InputText type='text' submitElementKey='ship_id' maxLength={12}>
                Scan Ship ID
            </InputText>
        </Form>
    </div>
}

function ReceiveItemID({ user, setStage }: ReceiveProps) {
    let [message, setMessage] = useState<InlineMessageSettings>({ type: 'danger' })

    return <div><ApplicationHeader header='Receive' operationStatus='primary' displayOptionsMenu={true}>
        <button className='dropdown-item fs-6'>Report problem</button>
    </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
        <Form positionedAtCentered={true}>
            <InputText type='text' submitElementKey='item_id' maxLength={12}>
                Scan Item ID
            </InputText>
        </Form>
    </div>
}

export function Receive({ user }: AuthenticatedUserProps) {

    let [stage, setStage] = useState(0)

    return <div>
        {(stage == ReceiveStage.SCAN_SHIP_ID) && <ReceiveScanID user={user} setStage={setStage} />}
        {(stage == ReceiveStage.SCAN_ITEM_ID) && <ReceiveItemID user={user} setStage={setStage} />}
    </div>
}
