import { useRef, useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader.jsx";
import { api } from "./api.jsx";
import { InlineMessage } from "./InlineMessage.jsx";

export default function CreateProductEmpty({ user }) {

    const [id, setId] = useState({})
    const [formData, setFormData] = useState({})
    const [message, setMessage] = useState({})

    const codeRef = useRef(null)
    const nameRef = useRef(null)
    const weightRef = useRef(null)
    const baseRef = useRef(null)

    function addProduct() {
        const code = codeRef.current.value.trim()

        const id = { code, baseCode: baseRef.current.value.trim() }

        if (!id.baseCode.startsWith('B00')) {
            setMessage({ message: 'Invalid base code ! Please provide at least valid base code.', type: 'error' })
        }
        formData.id = id
        formData.name = nameRef.current.value.trim()
        formData.weight = weightRef.current.value

        api.post('create-product/', formData)
            .then(response => {
                codeRef.current.value = ''
                nameRef.current.value = ''
                weightRef.current.value = 1
                setId({})
                setMessage({ message: 'Created product', type: "success" })
            })
    }

    return <div>
        <ApplicationHeader header={'Create product'} displayOptionsMenu={true} user={user} operationStatus={'primary'}>
        </ApplicationHeader>
        {!!message.message && <InlineMessage message={message.message} type={message.type} />}

        <div className="position-absolute translate-middle top-50 start-50 d-flex flex-column ">
            <div className="d-flex flex-column justify-content-center text-center mb-3">
                <label>Scan product code</label>
                <input className="form-control" type="text" maxLength={13} ref={codeRef}></input>
            </div>
            <div className="d-flex flex-column justify-content-center text-center mb-3">
                <label>Scan Base code</label>
                <input className="form-control" type="text" maxLength={10} ref={baseRef}></input>
            </div>
            <div className="d-flex flex-column justify-content-center text-center mb-3">
                <label>Enter Name</label>
                <input className="form-control" type="text" maxLength={64} ref={nameRef} ></input>
            </div>
            <div className="d-flex flex-column justify-content-center text-center mb-3">
                <label>Enter Weight [g]</label>
                <input className="form-control" type="number" maxLength={64} min={1} max={10000} ref={weightRef}></input>
            </div>
            <button className="btn btn-success mt-3" onClick={e => addProduct()}>Add Product</button>
        </div>
    </div >
}