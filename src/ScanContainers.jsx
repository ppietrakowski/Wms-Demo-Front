import { useState } from "react";
export default function ScanContainers({ setMessage, onFinishedScanning, validateContainer }) {
    const [containers, setContainers] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const handleAddContainer = (e) => {
        e.preventDefault();
        const code = inputValue.trim();

        if (code !== '') {
            if (!code.startsWith('cs') && !code.startsWith('ts')) {
                setMessage({ message: 'Scan valid type of container', type: 'danger' })
                return;
            }

            if (validateContainer && !validateContainer(code)) {
                setMessage({ message: 'Scan valid type of container', type: 'danger' })
                return;
            }

            if (!containers.includes(code)) {
                setContainers((prev) => [code, ...prev]);
            }

            setInputValue('');
        }
    };

    return (
        <div className="card shadow-sm border-0 mh-100 h-25">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0 fs-6">
                    <i className="bi bi-upc-scan me-2"></i>
                </h5>
                <span className="badge bg-primary rounded-pill">
                    {containers.length} {containers.length === 1 ? 'container' : 'containers'}
                </span>
            </div>
            <div className="card-body bg-gray-500 border-bottom p-3">
                <form onSubmit={handleAddContainer}>
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-gray-500 border-end-0 text-muted">
                            📦
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-2 shadow-none"
                            placeholder="Scan container code..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoComplete="off"
                            maxLength={12}
                        />
                        <button className="btn btn-primary px-4" type="submit">
                            Add
                        </button>
                    </div>
                </form>
            </div>

            <div
                className="card-body overflow-y-auto mh-100 h-25 p-3">
                {containers.length === 0 ? (
                    <></>
                ) : (
                    <ul className="list-group list-group-flush shadow-sm rounded">
                        {containers.map((item, index) => (
                            <li
                                key={index}
                                className="list-group-item d-flex justify-content-between align-items-center py-2 px-3"
                            >
                                <div className="d-flex align-items-center">
                                    <span className="badge bg-secondary text-light me-3 font-monospace">
                                        {containers.length - index}
                                    </span>
                                    <span className="fw-medium text-white">{item}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button className="btn btn-primary text-center text-end small py-2 rounded-0 " onClick={e => onFinishedScanning(containers)}>
                Scanned all containers
            </button>

        </div>
    );
}