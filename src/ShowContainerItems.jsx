import { useState } from "react";
import { ApplicationHeader } from "./ApplicationHeader.jsx";
import ScanFormText from "./ScanFormText.jsx";
import { api } from "./api.jsx";


function ScanContainer({ formData, setFormData, setStage }) {

    function onSubmit(container) {
        api.post('get-container-products/', {
            container: container
        })
            .then(response => {
                setFormData({ products: response.data.products })
                setStage(1)
            })
    }

    return <ScanFormText onSubmit={container => onSubmit(container)} outputName={'container'}>
        Scan Container
    </ScanFormText>
}

function ShowContainerContent({ formData, setFormData }) {
    function onSubmit(container) {
        api.post('get-container-products/', {
            container: container
        })
            .then(response => {
                setFormData({ products: response.data.products, totalCount: response.data.total_count, container })
            })
    }

    const { products } = formData

    return <ScanFormText onSubmit={container => onSubmit(container)} outputName={'container'} className={'w-100 p-3'}>
        <span className="fw-bold text-center">{formData.container}</span>
        <table className="table table-striped">
            <thead>
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
        <div>Total products: {Number(formData.totalCount || 0)}</div>
        <span className="text-center">Scan Container To retrieve next container content</span>
    </ScanFormText>
}

const Stages = [
    ScanContainer,
    ShowContainerContent
]

export default function ShowContainerItems({ user }) {

    const [formData, setFormData] = useState({})
    const [stage, setStage] = useState(0)

    const Component = Stages[stage] || 'div'

    return <div>
        <ApplicationHeader header={'Show container items'} operationStatus={'primary'} user={user} displayOptionsMenu={true}>
        </ApplicationHeader>
        <Component setFormData={setFormData} formData={formData} setStage={setStage} />
    </div>
}