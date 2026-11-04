
export default function ShowModal({ title, children, buttons, id }) {
    return <div class="modal fade" id={id} data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog  modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">{title}</h5>
                </div>
                <div class="modal-body">
                    {children}

                </div>
                <div class="modal-footer d-flex justify-content-between">
                    {buttons}
                </div>
            </div>
        </div>
    </div>
}