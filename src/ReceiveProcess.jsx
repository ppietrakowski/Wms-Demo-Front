import * as ReactRouter from 'react-router-dom'
import { ApplicationHeader } from './ApplicationHeader.jsx';
import { InlineMessage } from './InlineMessage.jsx';
import { Form } from './Form.jsx';
import InputText from './InputText.jsx';
import { api } from './api.jsx';
import React from 'react';
import { useState } from 'react';
import ScanFormText from './ScanFormText.jsx';
import ShowModal from './ShowModal.jsx';

const RS_SCAN_SHIP_ID = 0
const RS_SCAN_ITEM_ID = 1
const RS_SCAN_TOTE_ID = 2
const RS_SCAN_PROBLEM_CODE = 3
const RS_DISPLAY_PROBLEM_SCREEN = 4

const PSR_DAMAGED = 0
const PSR_DAMAGED_CODE = 1
const PSR_OVERFLOW = 2
const PSR_OTHER = 3


function ReceiveScanID({ user, setStage, setFormData, setMessage }) {
    async function submit(shipId) {
        try {
            const response = await api.post('get_receive_products/', { 'ship_id': shipId })
            const { products, message, type } = response.data

            setFormData({
                products: products,
                shipID: shipId,
                itemID: ''
            })

            setMessage({ message: message, type: 'success' })

            setStage(RS_SCAN_ITEM_ID)
        }
        catch (e) {
            setMessage({ message: `${e.response?.data.message}`, type: 'danger' })
        }
    }


    return <ScanFormText onSubmit={shipId => submit(shipId)} outputName={'dropzone'} className={'w-100 p-1'}>
        <span className="d-flex justify-content-center">Scan Ship Id</span>
    </ScanFormText>
}

function ReceiveItemID({ user, setStage, formData, setFormData, setMessage }) {
    async function submit(itemId) {
        api.get(`get-product/${itemId}/`).then(p => {
            const index = formData.products.findIndex(v => v.code == p.data.product['id'])
            if (index == -1) {
                setFormData({ psrReason: PSR_OVERFLOW, ...formData })
                setStage(RS_SCAN_PROBLEM_CODE)
                setMessage({ message: 'Overflow detected', type: 'danger' })
            }
            else {
                if (formData.products[index].current_count <= 0) {
                    setMessage({ message: 'No such item', type: 'danger' })
                }
                else {
                    setMessage({ 'type': 'success', 'message': `Selected item ${itemId}(${formData.products[index].code})` })
                    setFormData({ itemID: p.data.product['id'], shipID: formData.shipID, products: formData.products })
                    setStage(RS_SCAN_TOTE_ID)
                }
            }
        }).catch(e => console.log(e))
    }

    return <ScanFormText onSubmit={itemId => submit(itemId)} outputName={'dropzone'} className={'w-100 p-1'}>
        <span className="d-flex justify-content-center">Scan Item Id</span>
    </ScanFormText>
}


function ReceiveScanToteID({ user, setStage, formData, setFormData, setMessage }) {

    async function submit(toteId) {

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

        api.post(`container/move-product/`, {
            'count': 1,
            'product': formData.itemID,
            'destination_container': toteId,
            'source_container': formData.shipID
        })
            .then(response => {
                if (response.status == 200 || response.status == 201) {
                    formData.products[index].current_count -= 1
                    if (formData.products[index].current_count <= 0) {
                        formData.products.splice(index, 1)
                    }

                    setFormData({ shipID: formData.shipID, products: formData.products, itemID: '' })
                    setMessage({ message: `Inserted product \'${formData.itemID}\' to '${toteId}'`, type: 'success' })
                    setStage(RS_SCAN_ITEM_ID)
                }
            })
            .catch(e => {
                console.log(e.response.data)
            })

    }

    return <ScanFormText onSubmit={toteId => submit(toteId)} outputName={'dropzone'} className={'w-100 p-1'}>
        <span className="d-flex justify-content-center">Scan Sellable Tote Id</span>
    </ScanFormText>
}

export function ReceiveProblemMenu({ setStage, setFormData, formData, setMessage }) {


    const buttonClass = 'btn btn-lg btn-dark w-100 rounded-0'

    return
}


export function ReceiveScanProblemId({ setStage, setFormData, formData, setMessage }) {
    async function submit(psrId) {
        try {
            await api.put('receive/ps-raise', {
                reason: formData.psrReason,
                ship_id: formData.shipID,
                psr_id: psrId,
            })
            setMessage({ message: e.response?.data.message, 'type': 'error' })
        } catch (e) {
            setMessage({ message: e.response?.data.message, 'type': 'error' })
        }

        setFormData({ ...formData, itemID: '' })
        setMessage({ message: `Send product ${psrId} to Problem Solve`, type: 'success' })
        setStage(RS_SCAN_ITEM_ID)
    }

    return <ScanFormText onSubmit={problemId => submit(problemId)} outputName={'dropzone'} className={'w-100 p-1'}>
        <span className="d-flex justify-content-center">Scan Problem Id</span>
        <button className='w-100 btn btn-secondary mt-5' onClick={e => setStage(RS_SCAN_ITEM_ID)}>Cancel</button>
    </ScanFormText>
}

export function Receive({ user }) {

    let [stage, setStage] = useState(0)
    let [formData, setFormData] = useState({ itemID: '', products: [], shipID: '' })

    let [message, setMessage] = useState({ type: 'danger' })
    function submitPSRReason(reason) {
        setFormData({ psrReason: reason, ...formData })
        setStage(RS_SCAN_PROBLEM_CODE)
    }
    const StagesWithProblemSolveButton = [RS_SCAN_ITEM_ID, RS_SCAN_TOTE_ID]

    return <div>
        <ApplicationHeader user={user} header='Receive' operationStatus='primary' displayOptionsMenu={true}>
            {
                (StagesWithProblemSolveButton.some(v => v == stage)) ?
                    <button className='dropdown-item fs-6' data-bs-toggle="modal" data-bs-target="#raise-error">Report problem</button> :
                    <></>
            }
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}
        {(stage == RS_SCAN_SHIP_ID) && <ReceiveScanID setMessage={setMessage} formData={formData} setFormData={setFormData} user={user} setStage={setStage} />}
        {(stage == RS_SCAN_ITEM_ID) && <ReceiveItemID setMessage={setMessage} formData={formData} setFormData={setFormData} user={user} setStage={setStage} />}
        {(stage == RS_SCAN_TOTE_ID) && <ReceiveScanToteID setMessage={setMessage} formData={formData} setFormData={setFormData} user={user} setStage={setStage} />}
        {(stage == RS_SCAN_PROBLEM_CODE) && <ReceiveScanProblemId setMessage={setMessage} formData={formData} setFormData={setFormData} user={user} setStage={setStage} />}
        <ShowModal id={'raise-error'} title={'Select problem reason'} buttons={
            [
                <div className="d-flex">
                    <button type="button" class="btn btn-primary m-1" onClick={e => submitPSRReason(PSR_DAMAGED)} data-bs-dismiss="modal">Damaged</button>
                    <button type="button" class="btn btn-primary m-1" onClick={e => submitPSRReason(PSR_DAMAGED_CODE)} data-bs-dismiss="modal">Damaged Code</button>
                    <button type="button" class="btn btn-primary m-1" onClick={e => submitPSRReason(PSR_OTHER)} data-bs-dismiss="modal">Other</button>
                    <button type="button" class="btn btn-primary m-1" data-bs-dismiss="modal">Cancel</button>
                </div>
            ]}>
            Select reason for report problem
        </ShowModal>
    </div>
}
