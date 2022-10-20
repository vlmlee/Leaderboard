import React from 'react';
import '../stylesheets/Modal.scss';

interface IModal {
    closeModal: () => void;
    onAccept: any;
    children?: JSX.Element;
    altText?: string;
}

const Modal = ({ closeModal, children, onAccept, altText }: IModal) => {
    return (
        <div className={'modal__container'}>
            <div className={'modal'}>
                {children}
                <div className={'modal__buttons'}>
                    <button className={'modal__buttons--yes'} onClick={() => onAccept()}>
                        {altText !== '' ? altText : 'yes'}
                    </button>
                    <button className={'modal__buttons--cancel'} onClick={() => closeModal()}>
                        cancel
                    </button>
                </div>
            </div>
            <div className="modal__overlay" id="modal-overlay" onClick={() => closeModal()}></div>
        </div>
    );
};

export default Modal;
