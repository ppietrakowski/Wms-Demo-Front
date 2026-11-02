import { CSSProperties, ReactNode, use, useEffect, useState } from 'react';
import * as ReactRouter from 'react-router-dom'
import { ApplicationHeader } from './ApplicationHeader.jsx';
import { InlineMessage } from './InlineMessage.jsx';

function ApplicationCategory({ name, children }) {
    const BsTargetId = `collapse${name}`
    const HeaderId = `heading${name}`
    return <div className='accordion accordion-flush border-bottom border-gray-600' id={name}>
        <div className="accordion-item">
            <h2 className="accordion-header" id={HeaderId}>
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#${BsTargetId}`} aria-expanded="true" aria-controls={BsTargetId}>
                    {name}
                </button>
            </h2>
            <div id={BsTargetId} className="accordion-collapse collapse" aria-labelledby={HeaderId} data-bs-parent={`#${name}`}>
                <div className="accordion-body">
                    {children}
                </div>
            </div>
        </div>
    </div >
}

function CategoryElement({ name, redirectionAddress }) {

    if (!redirectionAddress) {
        return <button key={name.split(' ')[0]} className='btn py-2 px-3 d-flex justify-content-between align-items-center w-100 rounded-0'>
            <span>{name}</span>
            <span className="badge rounded-pill bg-warning-subtle">During implementation</span>
        </button>
    }

    return <ReactRouter.Link to={redirectionAddress} className='btn py-2 px-3 d-flex justify-content-between align-items-center w-100 rounded-0'>
        {name}
    </ReactRouter.Link>
}

function SelectApplication() {
    return <div className='vw-100'>
        <ApplicationCategory name='Inbound'>
            <CategoryElement name='Receive' redirectionAddress='/receive' />
            <CategoryElement name='Stow' redirectionAddress='/stow' />
            <CategoryElement name='Move to dropzone' redirectionAddress='/move-dropzone' />
        </ApplicationCategory>
        <ApplicationCategory name='Outbound'>
            <CategoryElement name='Pick' />
            <CategoryElement name='Ship' />
        </ApplicationCategory>
        <ApplicationCategory name='ICQA'>
            <CategoryElement name='FC Research' />
            <CategoryElement name='Count products in location' />
        </ApplicationCategory>
        <ApplicationCategory name='Utilities'>
            <CategoryElement name='Display code128' />
            <CategoryElement name='Print code128' />
            <CategoryElement name='[Debug] Display inline message' />
        </ApplicationCategory>
    </div>
}



export function MainMenu({ user }) {
    let [message, setMessage] = useState('')

    return <div>
        <ApplicationHeader user={user} header='Home' operationStatus='primary' displayOptionsMenu={false} />
        {message && <InlineMessage message='Testing messages' type='primary' />}
        <SelectApplication />
    </div>
}
