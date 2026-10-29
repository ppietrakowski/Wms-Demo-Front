import { CSSProperties, ReactNode, use, useEffect, useState } from 'react';
import * as ReactRouter from 'react-router-dom'
import { ApplicationHeader } from './ApplicationHeader.tsx';
import { InlineMessage, InlineMessageSettings } from './InlineMessage.tsx';

export function Receive() {
    let [message, setMessage] = useState<InlineMessageSettings>({ type: 'danger' })

    return <div>
        <ApplicationHeader header='Receive' operationStatus='primary' displayOptionsMenu={true}>
            <button className='dropdown-item fs-6'>Report problem</button>
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
    </div>
}
