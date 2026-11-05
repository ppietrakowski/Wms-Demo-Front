import { useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader";
import ScanFormText from "./ScanFormText";
import { InlineMessage } from "./InlineMessage";
import { api } from "./api";

const SCAN_CONTAINER = 0
const SCAN_PRODUCTS = 1

function ScanContainer({ setMessage, setFormData, setStage }) {
    function submit(container) {
        if (container.length < 12) {
            setMessage({ message: 'Invalid code, Please scan container code type', type: 'error' })
        }
        else {
            setMessage({ message: `Selecting to container ${container}`, type: 'success' })
            setFormData({ container });
            setStage(SCAN_PRODUCTS);
        }
    }

    return <ScanFormText outputName={'container'} onSubmit={container => submit(container)}>
        Scan container
    </ScanFormText>
}

function ScanProducts({ formData, setFormData, setMessage, setStage }) {
    const [products, setProducts] = useState([])
    const [count, setCount] = useState(0)

    function submit(product) {

        api.get(`get-product/${product}/`).then(response => {

            const baseProductCode = response.data.product['id']
            const index = products.findIndex(v => v.product == baseProductCode)
            if (index == -1) {
                setProducts(products.concat([{ product: baseProductCode, count: 1 }]))
            } else {
                products[index].count += 1
                setProducts(products)
            }

            setCount(count + 1)
        })
    }

    function onScannedAllProducts() {
        api.put('add-items-container/', {
            container: formData.container,
            products: products
        })
            .then(response => {
                setMessage({ message: `Inserted ${count} items to ${formData.container}`, type: 'success' })
                setStage(SCAN_CONTAINER)
            })
    }

    return <ScanFormText onSubmit={product => submit(product)} outputName={'dropzone'} className={'w-100 p-1'}>
        <span className="d-flex justify-content-center fw-bold">Scan products</span>
        <span className="d-flex justify-content-center">Scanned {count} products</span>
        <button className="btn btn-primary pt-3 pb-3" onClick={e => onScannedAllProducts()}>Scanned all products</button>
        <button className="btn btn-secondary pt-3 pb-3" onClick={e => setStage(STOW_SCAN_CONTAINER)}>Cancel</button>
    </ScanFormText>
}

const States = [
    ScanContainer,
    ScanProducts
]

export default function CreateContainerItems({ user }) {
    const [message, setMessage] = useState({})
    const [stage, setStage] = useState(0)
    const [formData, setFormData] = useState(0)

    const Component = States[stage]

    return <div className="w-100 h-100">
        <ApplicationHeader header={'Create Container'} user={user} displayOptionsMenu={true} operationStatus={message.type || 'primary'}>
        </ApplicationHeader>
        {message.message && <InlineMessage message={message.message} type={message.type} />}

        <Component setMessage={setMessage} setStage={setStage} setFormData={setFormData} formData={formData} />
    </div>
}