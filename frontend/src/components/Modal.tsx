import React from 'react';
import '../stylesheets/Modal.scss';

interface IModal {
    closeModal: (state: boolean) => void;
    children?: JSX.Element;
}

const Modal = ({ closeModal, children }: IModal) => {
    return (
        <div className={'modal__container'}>
            <div className={'modal'}>{children}</div>
            <div className="modal__overlay" id="modal-overlay" onClick={() => closeModal(false)}></div>
        </div>
    );
};

export default Modal;
