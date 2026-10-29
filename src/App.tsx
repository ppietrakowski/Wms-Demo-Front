import * as ReactRouter from 'react-router-dom'
import { CSSProperties, ReactNode, use, useEffect, useState } from 'react';

interface ApplicationHeaderProps {
    operationStatus?: string
    header: string
    displayOptionsMenu?: boolean
    children?: ReactNode | ReactNode[]
}

interface DropDownSettings {
    icon: string | undefined
    label?: string
    dropdownOnRightSide?: boolean
    children?: ReactNode | ReactNode[]
}

export function DropDown({ children, icon, label, dropdownOnRightSide = false }: DropDownSettings) {
    let className = 'dropdown-menu'

    if (dropdownOnRightSide) {
        className += ' dropdown-menu-end'
    }

    let iconDiv = <></>

    if (icon) {
        iconDiv = <i className={icon}></i>
    }
    else {
        iconDiv = <span>{label}</span>
    }

    return <div className="position-relative">
        <ReactRouter.Link className="nav-link" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" to="" aria-expanded="false">
            {iconDiv}
        </ReactRouter.Link>
        <ul className={className}
            aria-labelledby="dropdownMenuButton1">
            {children}
        </ul>
    </div>
}

function ApplicationHeader({ operationStatus, header, displayOptionsMenu, children }: ApplicationHeaderProps) {

    let style: CSSProperties = {
        filter: 'brightness(0.9)',
        gridTemplateColumns: '1fr auto 1fr',
    }

    if (operationStatus == 'primary') {
        style['color'] = 'white'
    }

    return <header className={`d-grid align-items-center navbar navbar-light bg-${operationStatus}-subtle px-3`} style={style}>
        {
            displayOptionsMenu ?
                (
                    <DropDown icon='fa fa-bars'>
                        <ReactRouter.Link className='dropdown-item fs-6' to={'/'}>Menu</ReactRouter.Link>
                        <ReactRouter.Link className='dropdown-item fs-6' to={'/logout'}>Logout</ReactRouter.Link>
                        {children}
                    </DropDown>
                ) :
                (<div></div>)
        }

        <div className='fw-bold text-center'>{header}</div>
        <div className='text-end'>
            $User
        </div>
    </header >
}

interface ApplicationCategoryProps {
    name: string
    children?: React.ReactNode | React.ReactNode[]
}

function ApplicationCategory({ name, children }: ApplicationCategoryProps) {
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

interface CategoryElementProps extends ApplicationCategoryProps {
    redirectionAddress?: string
}

function CategoryElement({ name, redirectionAddress }: CategoryElementProps) {

    if (!redirectionAddress) {
        return <button key={name.split(' ')[0]} className='btn py-2 px-3 d-flex justify-content-between align-items-center w-100 rounded-0'>
            <span>{name}</span>
            <span className="badge rounded-pill bg-warning-subtle">During implementation</span>
        </button>
    }

    return <ReactRouter.Link to={'/receive'} className='btn py-2 px-3 d-flex justify-content-between align-items-center w-100 rounded-0'>
        {name}
    </ReactRouter.Link>
}

function SelectApplication() {
    return <div className='vw-100'>
        <ApplicationCategory name='Inbound'>
            <CategoryElement name='Receive' redirectionAddress='receive' />
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

    let icon = <div></div>

    if (type == 'primary') {
        icon = <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlinkHref="#info-fill" /></svg>
    }
    else if (type == 'success') {
        icon = <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlinkHref="#check-circle-fill" /></svg>
    }
    else if (type == 'warning') {
        icon = <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlinkHref="#exclamation-triangle-fill" /></svg>
    }
    else if (type == 'danger') {
        icon = <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlinkHref="#exclamation-triangle-fill" /></svg>
    }

    return <div className={`alert alert-${type} rounded-0 border-0`}>
        {icon}
        <span>{message}</span>
    </div>
}

function MainMenu() {
    let [message, setMessage] = useState<string>('')

    return <div>
        <ApplicationHeader header='Home' operationStatus='primary' />
        {message && <InlineMessage message='Testing messages' type='primary' />}
        <SelectApplication />
    </div>
}

interface InlineMessageSettings {
    message?: string
    type: string
}

function Receive() {
    let [message, setMessage] = useState<InlineMessageSettings>({ type: 'danger' })

    return <div>
        <ApplicationHeader header='Receive' operationStatus='primary' displayOptionsMenu={true}>
            <button className='dropdown-item fs-6'>Report problem</button>
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
    </div>
}

function Application() {
    return <ReactRouter.HashRouter>
        <ReactRouter.Routes>
            {/* Public Login Route */}
            <ReactRouter.Route
                path="/receive"
                element={<Receive />}
            />
            <ReactRouter.Route path="*" element={<MainMenu />} />
        </ReactRouter.Routes>
    </ReactRouter.HashRouter>
}

export default Application;
