import { CSSProperties, ReactNode, use, useEffect, useState } from 'react';
import * as ReactRouter from 'react-router-dom'
import { ApplicationHeader } from './ApplicationHeader.tsx';
import { InlineMessage, InlineMessageSettings } from './InlineMessage.tsx';
import { Form, FormSubmitEvent } from './Form.tsx';
import InputText from './InputText.tsx';
import { User } from './MainMenu.tsx';
import { AuthenticatedUserProps } from './Login.tsx';
import axios, { AxiosError } from 'axios';
import { api } from './Api.tsx';

enum ReceiveStage {
    SCAN_SHIP_ID = 0,
    SCAN_ITEM_ID,
    SCAN_TOTE_ID,
    SCAN_PROBLEM_CODE,
    DISPLAY_PROBLEM_SCREEN,
}

interface ReceiveProductInfo {
    code: string
    current_count: number
    damaged: boolean
    total_count: number
}

enum ReceivePSReason {
    DAMAGED,
    DAMAGED_CODE,
    OVERFLOW
}

interface ReceiveFormData {
    shipID: string
    itemID: string
    psrReason?: ReceivePSReason

    products: ReceiveProductInfo[]
}

interface ReceiveProps extends AuthenticatedUserProps {
    setStage: React.Dispatch<React.SetStateAction<ReceiveStage>>
    setFormData: React.Dispatch<React.SetStateAction<ReceiveFormData>>
    setMessage: React.Dispatch<React.SetStateAction<InlineMessageSettings>>
    formData: ReceiveFormData
}

function ReceiveScanID({ user, setStage, setFormData, setMessage }: ReceiveProps) {
    async function onSubmitForm(e: FormSubmitEvent) {
        try {
            const shipId = e.getString('ship_id')
            const response = await api.post('get_receive_products/', { 'ship_id': shipId })
            const { products, message, type } = response.data

            setFormData({
                products: products,
                shipID: shipId,
                itemID: ''
            })

            setMessage({ message: message, type: 'success' })

            setStage(ReceiveStage.SCAN_ITEM_ID)
        }
        catch (e) {
            const ex = e as AxiosError
            setMessage({ message: `${ex.response?.data.message}`, type: 'danger' })
        }
    }


    return <div>
        <Form positionedAtCentered={true} submitCallback={e => onSubmitForm(e)}>
            <InputText type='text' submitElementKey='ship_id' maxLength={12}>
                Scan Ship ID
            </InputText>
        </Form>
    </div>
}

function ReceiveItemID({ user, setStage, formData, setFormData, setMessage }: ReceiveProps) {
    function onSubmit(e: FormSubmitEvent) {
        const itemId = e.getString('item_id')

        const index = formData.products?.findIndex(v => v.code == itemId)
        if (index == -1) {
            setMessage({ message: 'No such item', type: 'danger' })
        }
        else {
            if (formData.products[index].current_count <= 0) {
                setMessage({ message: 'No such item', type: 'danger' })
            }
            else {
                setMessage({ 'type': 'success', 'message': `Selected item ${itemId}` })
                setFormData({ itemID: itemId, shipID: formData.shipID, products: formData.products })
                setStage(ReceiveStage.SCAN_TOTE_ID)
            }
        }
    }

    return <div>
        <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
            <InputText type='text' submitElementKey='item_id' maxLength={12}>
                Scan Item ID
            </InputText>
        </Form>
    </div>
}


function ReceiveScanToteID({ user, setStage, formData, setFormData, setMessage }: ReceiveProps) {

    async function onSubmit(e: FormSubmitEvent) {
        const toteId = e.getString('tote_id')

        if (!toteId.startsWith('ts')) {
            setMessage({ 'message': 'Invalid container, please scan tote ID with \'ts\' code', 'type': 'danger' })
            return;
        }

        if (toteId.startsWith('tsDMG')) {
            setMessage({ 'message': 'Invalid container, please scan sellable tote ID', 'type': 'danger' })
            return;
        }

        let index = formData.products.findIndex(v => v.code == formData.itemID)
        const testHasSameFlagsResponse = await api.post('has_container_same_damage_flag_as_next_product', {
            'tote_id': toteId,
            'damaged': false
        })

        if (!testHasSameFlagsResponse.data) {
            setMessage({ 'message': 'Invalid container. Use empty or sellable container !', 'type': 'danger' })
            return;
        }

        const response = await api.post(`container/move-product/`, {
            'count': 1,
            'product': formData.itemID,
            'destination_container': toteId,
            'source_container': formData.shipID
        })

        if (response.status == 200 || response.status == 201) {
            formData.products[index].current_count -= 1
            if (formData.products[index].current_count <= 0) {
                formData.products.splice(index, 1)
            }

            setFormData({ shipID: formData.shipID, products: formData.products, itemID: '' })
            setMessage({ message: `Inserted product \'${formData.itemID}\' to '${toteId}'`, type: 'success' })
            setStage(ReceiveStage.SCAN_ITEM_ID)
        }
    }

    return <div>
        <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
            <InputText type='text' submitElementKey='tote_id' maxLength={12}>
                Scan Sellable Tote Id
            </InputText>
        </Form>
    </div>
}

export function ReceiveProblemMenu({ setStage, setFormData, formData, setMessage }: ReceiveProps) {
    async function onSubmit(reason: ReceivePSReason) {
        setFormData({ psrReason: reason, ...formData })
        setStage(ReceiveStage.SCAN_PROBLEM_CODE)
    }

    const buttonClass = 'btn btn-lg btn-dark w-100 rounded-0'

    return <div className='vw-100 position-absolute top-50 start-50 translate-middle max-w-md d-flex justify-content-center align-items-center flex-column'>
        <h1>Select problem reason</h1>
        <button className={buttonClass} onClick={e => onSubmit(ReceivePSReason.DAMAGED)}>Product damaged</button>
        <button className={buttonClass} onClick={e => onSubmit(ReceivePSReason.DAMAGED_CODE)}>Damaged code</button>
        <button className='btn btn-lg btn-dark w-100 rounded-0' onClick={e => { setStage(ReceiveStage.SCAN_ITEM_ID); setMessage({ type: '' }) }}>Cancel</button>
    </div>
}


export function ReceiveScanProblemId({ setStage, setFormData, formData, setMessage }: ReceiveProps) {
    async function onSubmit(e: FormSubmitEvent) {
        try {
            const response = await api.put('receive/ps-raise', {
                reason: formData.psrReason,
                ship_id: formData.shipID,
                psr_id: e.getString('psr_id'),
            })
            setMessage({ message: e.response?.data.message, 'type': 'error' })
        } catch (e) {
            setMessage({ message: e.response?.data.message, 'type': 'error' })
        }

        setFormData({ ...formData, itemID: '' })
        setMessage({ message: `Send product ${e.getString('psr_id')} to Problem Solve`, type: 'success' })
        setStage(ReceiveStage.SCAN_ITEM_ID)
    }

    return <Form positionedAtCentered={true} submitCallback={e => onSubmit(e)}>
        <InputText type='text' submitElementKey='psr_id' maxLength={12}>
            Scan Problem ID
        </InputText>
    </Form>
}

export function Receive({ user }: AuthenticatedUserProps) {

    let [stage, setStage] = useState(0)
    let [formData, setFormData] = useState<ReceiveFormData>({ itemID: '', products: [], shipID: '' })

    let [message, setMessage] = useState<InlineMessageSettings>({ type: 'danger' })

    const StagesWithProblemSolveButton = [ReceiveStage.SCAN_ITEM_ID, ReceiveStage.SCAN_TOTE_ID]

    return <div>
        <ApplicationHeader user={user} header='Receive' operationStatus='primary' displayOptionsMenu={true}>
            {
                (StagesWithProblemSolveButton.some(v => v == stage)) ?
                    <button className='dropdown-item fs-6' onClick={e => setStage(ReceiveStage.DISPLAY_PROBLEM_SCREEN)}>Report problem</button> :
                    <></>
            }
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
        {(stage == ReceiveStage.SCAN_SHIP_ID) && <ReceiveScanID setMessage={setMessage} formData={formData} setFormData={setFormData} user={user} setStage={setStage} />}
        {(stage == ReceiveStage.SCAN_ITEM_ID) && <ReceiveItemID setMessage={setMessage} formData={formData} setFormData={setFormData} user={user} setStage={setStage} />}
        {(stage == ReceiveStage.SCAN_TOTE_ID) && <ReceiveScanToteID setMessage={setMessage} formData={formData} setFormData={setFormData} user={user} setStage={setStage} />}
        {(stage == ReceiveStage.DISPLAY_PROBLEM_SCREEN) && <ReceiveProblemMenu setMessage={setMessage} formData={formData} setFormData={setFormData} user={user} setStage={setStage} />}
        {(stage == ReceiveStage.SCAN_PROBLEM_CODE) && <ReceiveScanProblemId setMessage={setMessage} formData={formData} setFormData={setFormData} user={user} setStage={setStage} />}

    </div>
}
