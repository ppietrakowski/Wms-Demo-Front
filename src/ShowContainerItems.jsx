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
                setFormData({ container, products: response.data.products, totalCount: response.data.total_count })
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

    return <div className="h-100 w-100" >
        <ScanFormText onSubmit={container => onSubmit(container)} outputName={'container'} className={'w-100 p-3'}>
        </ScanFormText>

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
            <span className="text-center">Scan Container To retrieve next container content</span>
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

    const Component = Stages[stage] || 'div'

    return <div className="vw-100 vh-100">
        <ApplicationHeader header={'Show container items'} operationStatus={'primary'} user={user} displayOptionsMenu={true}>
        </ApplicationHeader>
        <div className="position-fixed bottom-0 start-0 ps-1 bg-dark text-white w-100">{formData.container}</div>
        <Component setFormData={setFormData} formData={formData} setStage={setStage} />
    </div>
}