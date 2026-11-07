import { useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader.jsx";
import ScanFormText from "./ScanFormText.jsx";
import ShowModal from "./ShowModal";
import { InlineMessage } from "./InlineMessage.jsx";
import { api } from "./api.jsx";

const MOVE_MODE_SINGLE = 0
const MOVE_MODE_ALL_PRODUCT = 1
const MOVE_MODE_ALL_CONTAINER = 2

function ChangeModeButton({ text, currentMode, targetMode, setMode, setMessage }) {
    function changeMode() {
        if (currentMode != targetMode) {
            setMessage({ message: `Changed mode to '${text}'`, type: 'success' })
            setMode(targetMode)
        }
    }

    return <button className="btn m-1 btn-secondary d-flex justify-content-between" data-bs-dismiss="modal" onClick={e => changeMode()}>
        {text}
        {
            (currentMode == targetMode) ?
                (<span class="badge rounded-pill bg-dark">
                    Active
                    <span class="visually-hidden">unread messages</span>
                </span>)
                :
                (<div></div>)
        }

    </button>
}


function ScanSourceContainer({ setFormData, setMessage, advanceStage }) {

    function onSubmitContainer(container) {
        setFormData({ sourceContainer: container })
        advanceStage()
    }

    return <ScanFormText outputName={'container'} onSubmit={container => onSubmitContainer(container)}>
        Scan source container
    </ScanFormText>
}

function ScanProduct({ setFormData, formData, setMessage, advanceStage }) {
    function checkHasProduct(product) {
        api.post(`stow-get-product/`, {
            product_code: product,
            container: formData.sourceContainer,
        }).
            then(response => {
                product = response.data.product
                setFormData({ ...formData, product: response.data.product })
                advanceStage()
            })
            .catch(e => {
                setMessage({ message: e.toString(), type: 'error' })
            })
    }

    return <ScanFormText outputName={'product'} onSubmit={product => checkHasProduct(product)}>
        Scan Product
    </ScanFormText>
}


function ScanProductDestinationContainer({ setFormData, setMessage, formData, moveMode, advanceStage }) {

    function doMoveToContainer(destinationContainer) {
        const count = (moveMode == MOVE_MODE_ALL_PRODUCT) ? formData.product.count : 1
        api.post('stow-item/', {
            container: formData.sourceContainer,
            item: formData.product.id,
            count: count,
            target_bin: destinationContainer
        })
            .then(response => {
                setMessage({ message: `Moved ${formData.product.id}x${count} to ${destinationContainer}`, type: 'success' })
                setFormData({});
                advanceStage();
            })
            .catch(e => setMessage({ message: e.toString(), type: 'danger' }))
    }

    return <ScanFormText outputName={'container'} onSubmit={destinationContainer => doMoveToContainer(destinationContainer)}>
        <span>Scan destination container</span>
    </ScanFormText>
}


function ScanDestinationContainer({ setFormData, setMessage, formData, moveMode, advanceStage }) {

    function doMoveToContainer(destinationContainer) {
        api.post('get-container-products/', {
            container: formData.sourceContainer
        })
            .then(async v => {

                for (const product of v.data.products) {
                    await api.post('stow-item/', {
                        container: formData.sourceContainer,
                        item: product.id,
                        count: product.count,
                        target_bin: destinationContainer
                    })
                }
                setMessage({ message: `Moved products from ${formData.sourceContainer} to ${destinationContainer}`, type: 'success' })
                setFormData({});
                advanceStage();
            })
            .catch(e => setMessage({ message: e.toString(), type: 'danger' }))
    }

    return <ScanFormText outputName={'container'} onSubmit={destinationContainer => doMoveToContainer(destinationContainer)}>
        <span>Scan destination container</span>
    </ScanFormText>
}

const FullContainerStages = [
    ScanSourceContainer,
    ScanDestinationContainer
]

const ProductSingleStages = [
    ScanSourceContainer,
    ScanProduct,
    ScanProductDestinationContainer
]

const StagesByMode = [
    ProductSingleStages,
    ProductSingleStages,
    FullContainerStages
]

export default function MoveItemFromContainerToContainer({ user }) {

    const [formData, setFormData] = useState({})
    const [stage, setStage] = useState(0)
    const [mode, setMode] = useState(MOVE_MODE_SINGLE)
    const [message, setMessage] = useState({})
    const Stages = StagesByMode[mode]

    const Component = Stages[stage]
    const advanceStage = () => setStage((stage + 1) % Stages.length)

    return <div>
        <ApplicationHeader displayOptionsMenu={true} header={'Move product to container'} user={user} operationStatus={message.type || 'primary'}>
            <button className="btn dropdown-item" data-bs-toggle="modal" data-bs-target="#show-mode-change">Change moving mode</button>
        </ApplicationHeader>
        <InlineMessage message={message.message} type={message.type} />
        <Component setFormData={setFormData} formData={formData} setMessage={setMessage} moveMode={mode} advanceStage={advanceStage} />

        <ShowModal buttons={[<button className="btn btn-primary" data-bs-dismiss="modal">Cancel</button>]} id={'show-mode-change'} title={'Change moving mode'}>
            <div className="d-flex flex-column">
                <ChangeModeButton currentMode={mode} setMessage={setMessage} targetMode={MOVE_MODE_SINGLE} setMode={setMode} text={'Single move mode'} />
                <ChangeModeButton currentMode={mode} setMessage={setMessage} targetMode={MOVE_MODE_ALL_PRODUCT} setMode={setMode} text={'Full product move mode'} />
                <ChangeModeButton currentMode={mode} setMessage={setMessage} targetMode={MOVE_MODE_ALL_CONTAINER} setMode={setMode} text={'Full container move mode'} />
            </div>
        </ShowModal>

    </div>
}