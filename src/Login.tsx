import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from './Api.tsx';
import { Form, FormSubmitEvent } from './Form.tsx';
import InputText from './InputText.tsx';
import { FormButton } from './FormButton.tsx';
import { InlineMessage, InlineMessageSettings } from './InlineMessage.tsx';
import { getErrorMessage } from './apiGetMessage.tsx';

export interface UserData {
    username: string
    roles: string[]
    id: number
}

interface LoginSettings {
    onLoginSuccess: (userData: UserData) => void
    onLoginFailure?: (error: Error) => void
}

export interface AuthenticatedUserProps {
    user: UserData
}

export function Login({ onLoginSuccess, onLoginFailure }: LoginSettings) {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [inlineMessage, setInlineMessage] = React.useState<InlineMessageSettings>({ message: '', type: '' })

    const handleLogin = async (e: FormSubmitEvent) => {
        try {
            // ask for token
            await api.post('token/', credentials);
            // receive user information from authuser
            const user = await api.get('authuser/');

            onLoginSuccess(user.data)
        } catch (err) {
            setInlineMessage({
                message: `${getErrorMessage(err)}`,
                type: 'error'
            })
            onLoginFailure && onLoginFailure(err as Error)
        }
    };


    return (
        <div>
            {inlineMessage.message ? (<InlineMessage message={inlineMessage.message} tag={inlineMessage.type} />) : (<></>)}
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