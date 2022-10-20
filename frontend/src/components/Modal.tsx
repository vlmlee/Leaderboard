import React from 'react';
import '../stylesheets/Modal.scss';

interface IModal {
    closeModal: () => void;
    children?: JSX.Element;
}

const Modal = ({ closeModal, children }: IModal) => {
    return (
        <div className={'modal__container'}>
            <div className={'modal'}>
                {children}
                <div className={'modal__buttons'}>
                    <button className={'modal__buttons--yes'} onClick={() => {}}>
                        yes
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
