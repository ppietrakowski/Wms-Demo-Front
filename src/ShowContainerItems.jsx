import { useEffect, useRef, useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader.jsx";
import ScanFormText from "./ScanFormText.jsx";
import { api } from "./api.jsx";
import { InlineMessage } from "./InlineMessage.jsx";

function ScanContainerForm({ outputName, placeholder, onSubmit, className, children }) {

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const code = e.target.value.trim();

            if (code) {
                onSubmit(code)
            }

            e.target.value = '';
        }
    };

    const classes = ['d-flex flex-column justify-content-center text-center']

    if (className) {
        classes.push(className)
    }

    return <div className={classes.join(' ')}>
        {children}
        <input className="form-control" name={outputName} placeholder={placeholder} autoFocus={true} onKeyDown={e => handleKeyDown(e)} autoComplete="false">
        </input>
    </div>
}

function ScanContainer({ setMessage, formData, setFormData, setStage }) {

    function onSubmit(container) {
        api.post('get-container-products/', {
            container: container
        })
            .then(response => {
                if (response.data.message) {
                    setMessage({ message: response.data.message, type: response.data.type })
                } else {
                    setMessage({})
                }
                setFormData({ container, products: response.data.products, totalCount: response.data.total_count })
                setStage(1)
            })
    }

    return <div className="mb-3 position-fixed top-50 start-50 translate-middle">
        <ScanContainerForm outputName={"Scan Container"} onSubmit={onSubmit}>
            <div className="form-label text-center">Scan container</div>
        </ScanContainerForm>
    </div>
}

function ShowContainerContent({ setMessage, formData, setFormData }) {
    function onSubmit(container) {
        api.post('get-container-products/', {
            container: container
        })
            .then(response => {
                if (response.data.message) {
                    setMessage({ message: response.data.message, type: response.data.type })
                } else {
                    setMessage({})
                }

                setFormData({ products: response.data.products, totalCount: response.data.total_count, container })
            })
            .catch(error => {
            })
    }

    const { products } = formData

    return <div className="mvh-100 vw-100 d-flex flex-column" >
        <ScanContainerForm className={'ms-auto me-auto'} placeholder={formData.container} outputName={"Scan Container"} onSubmit={onSubmit}>
            <div className="form-label text-center">Scan container</div>
        </ScanContainerForm>

        <div className="table-responsive m-1" style={{ maxHeight: '33vw', overflowY: 'auto' }}>
            <table className="table table-striped">
                <thead className="sticky-top">
                    <tr>
                        <th scope="col">Index</th>
                        <th scope="col">Name</th>
                        <th scope="col">Base ID</th>
                        <th scope="col">Count</th>
                        <th scope="col">Damaged?</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((v, i) => <tr>
                        <td>{i + 1}</td>
                        <td>{v.name}</td>
                        <td>{v.id}</td>
                        <td>{v.count}</td>
                        <td>{v.damaged ? 'true' : 'false'}</td>
                    </tr>)}
                </tbody>
            </table>
        </div>

        <div className="w-100 d-flex flex-column justify-content-center mt-3 border-top border-2 ">
            <div className="text-center">Total products: {Number(formData.totalCount || 0)}</div>
        </div>
    </div>
}

const Stages = [
    ScanContainer,
    ShowContainerContent
]

export default function ShowContainerItems({ user }) {

    const [formData, setFormData] = useState({})
    const [stage, setStage] = useState(0)
    const [inlineMessage, setInlineMessage] = useState({})

    const Component = Stages[stage] || 'div'

    return <div className="vw-100 vh-100">
        <ApplicationHeader header={'Show container items'} operationStatus={'primary'} user={user} displayOptionsMenu={true}>
        </ApplicationHeader>
        {!!inlineMessage.message && <InlineMessage message={inlineMessage.message} type={inlineMessage.type} />}
        <div className="position-fixed bottom-0 start-0 ps-1 bg-dark text-white w-100">{formData.container}</div>
        <Component setFormData={setFormData} setMessage={setInlineMessage} formData={formData} setStage={setStage} />
    </div>
}