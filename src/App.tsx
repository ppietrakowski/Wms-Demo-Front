import * as ReactRouter from 'react-router-dom'
import { use, useEffect, useState } from 'react';

function ApplicationHeader() {
    return <header className='d-flex justify-content-center navbar navbar-expand-lg navbar-light navbar-dark-bg'>
        <div></div>
        <div>Home</div>
        <div></div>
    </header>
}

interface ApplicationCategoryProps {
    name: string
    children?: React.ReactNode | React.ReactNode[]
}

function ApplicationCategory({ name, children }: ApplicationCategoryProps) {
    let id = 'collapse-' + name.split(' ')[0]
    let raw_id = '#' + id

    return <div className='nav-link'>
        <button className='border-top border-1 w-100 p-2 fs-4' data-bs-toggle="collapse" data-bs-target={raw_id} aria-expanded="false" aria-controls={id} data-bs-offset="0,25" data-bs-display="static" type="button" >{name}</button>
        <div className="collapse" id={id}>
            {children}
        </div>
    </div>
}

function CategoryElement({ name }: ApplicationCategoryProps) {
    return <button key={name.split(' ')[0]} className='nav-link border-top-1 border-secondary border-1 pt-2 justify-content-start'>{name} [Not Implemented]</button>
}

type CategoriesApp = {
    [key: string]: string[]
}

function SelectApplication() {
    const Applications = ['Inbound', 'Outbound', 'Audit', 'Icqa', 'Settings']
    const AppToCategories: CategoriesApp = {
        'Inbound': ['Receive', 'Stow'],
        'Outbound': ['Pick', 'Ship'],
        'Audit': ['Count Location Items'],
        'Icqa': ['Check location', 'Locator'],
        'Settings': []
    }

    return <div className='d-flex justify-content-start vw-100 flex-column border-bottom border-1'>
        {Applications.map(v => <ApplicationCategory name={v}>{AppToCategories[v].map(e => <CategoryElement name={e} />)} </ApplicationCategory>)}
    </div>
}

function Application() {
    return <div>
        <ApplicationHeader />
        <SelectApplication />
    </div>
}

export default Application;
