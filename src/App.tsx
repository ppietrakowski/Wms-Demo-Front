import * as ReactRouter from 'react-router-dom'
import { use, useEffect, useState } from 'react';

interface ApplicationHeaderProps {
    operationStatus?: string
}

function ApplicationHeader({ operationStatus }: ApplicationHeaderProps) {

    let style = {
        filter: 'brightness(0.7)',
        gridTemplateColumns: '1fr auto 1fr',
    }

    if (operationStatus == 'primary') {
        style['color'] = 'white'
    }

    return <header className={`d-grid align-items-center navbar navbar-light bg-${operationStatus}-subtle px-3`} style={style}>
        <div></div>
        <div className='fw-bold text-center'>Home</div>
        <div className='text-end'>
            $User
        </div>
    </header>
}

interface ApplicationCategoryProps {
    name: string
    children?: React.ReactNode | React.ReactNode[]
}

function ApplicationCategory({ name, children }: ApplicationCategoryProps) {
    const BsTargetId = `collapse${name}`
    const HeaderId = `heading${name}`
    return <div className='accordion rounded-0' id={name}>
        <div className="accordion-item">
            <h2 className="accordion-header" id={HeaderId}>
                <button className="btn btn-light accordion-button collapsed rounded-0" type="button" data-bs-toggle="collapse" data-bs-target={`#${BsTargetId}`} aria-expanded="true" aria-controls={BsTargetId}>
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

function CategoryElement({ name }: ApplicationCategoryProps) {
    return <button key={name.split(' ')[0]} className='btn py-2 px-3 d-flex justify-content-between align-items-center w-100 rounded-0'>
        <span>{name}</span>
        <span className="badge rounded-pill bg-warning-subtle">During implementation</span>
    </button>
}

function SelectApplication() {
    return <div className='vw-100'>
        <ApplicationCategory name='Inbound'>
            <CategoryElement name='Receive' />
            <CategoryElement name='Stow' />
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

interface InlineMessageProps {
    message: string
    type: string
}

function InlineMessage({ message, type }: InlineMessageProps) {
    return <div className={`alert alert-${type} rounded-0 border-0`}>
        {message}
    </div>
}

function Application() {

    let [message, setMessage] = useState<string>('')

    return <div>
        <ApplicationHeader operationStatus='primary' />
        {message && <InlineMessage message='Testing messages' type='primary' />}
        <SelectApplication />
    </div>
}

export default Application;
