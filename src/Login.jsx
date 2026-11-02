import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from './api.jsx';
import { Form } from './Form.jsx';
import InputText from './InputText.jsx';
import { FormButton } from './FormButton.jsx';
import { InlineMessage } from './InlineMessage.jsx';
import { getErrorMessage } from './apiGetMessage.jsx';


export function Login({ onLoginSuccess, onLoginFailure }) {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [inlineMessage, setInlineMessage] = React.useState({ type: '' })

    const handleLogin = async (e) => {
        try {
            // ask for token
            await api.post('token/', credentials);
            // receive user information from authuser
            const user = await api.get('authuser/');

            onLoginSuccess(user.data)
        } catch (err) {
            setInlineMessage({
                message: `${getErrorMessage(err)}`,
                type: 'danger'
            })
            onLoginFailure && onLoginFailure(err)
        }
    };


    return (
        <div>
            {inlineMessage.message ? (<InlineMessage message={inlineMessage.message} type={inlineMessage.type} />) : (<></>)}
            <Form submitCallback={handleLogin} positionedAtCentered={true}>
                <InputText
                    type="text"
                    placeholder="Username"
                    className='mt-4'
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}>
                    Enter Username
                </InputText>
                <InputText
                    type="password"
                    placeholder="Password"
                    className='mt-4'
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}>
                    Enter password
                </InputText>
                <FormButton type='submit'>
                    Log In
                </FormButton>
            </Form >
        </div>
    );
}