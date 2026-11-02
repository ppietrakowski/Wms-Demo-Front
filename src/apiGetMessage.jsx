
import { Axios, AxiosError } from "axios";

export function getErrorMessage(error) {
    if (!error.response) {
        // Network failure, backend down, or CORS issue
        return 'Unable to connect to the server. Please check your internet connection.';
    }

    const { status, data, config } = error.response;
    const endpoint = config?.url || '';

    // 1. Specific handling for 401 Unauthorized
    if (status === 401) {
        if (endpoint.includes('token/refresh/')) {
            return 'Your session has expired. Please log in again.';
        }
        if (endpoint.includes('token/')) {
            return 'Invalid username or password.';
        }
        return 'You are not authorized to access this resource. Please log in.';
    }

    // 2. Extract specific validation errors returned by Django REST Framework
    if (data) {
        // Single string error response from DRF (e.g. {"detail": "..."})
        if (typeof data.detail === 'string') {
            return data.detail;
        }

        // Generic error string (e.g. {"error": "..."})
        if (typeof data.error === 'string') {
            return data.error;
        }

        // Field-level DRF errors (e.g. {"username": ["This field is required."]})
        if (typeof data === 'object') {
            const firstKey = Object.keys(data)[0];
            const firstError = data[firstKey];

            if (Array.isArray(firstError)) {
                return `${firstKey}: ${firstError[0]}`;
            }
            if (typeof firstError === 'string') {
                return `${firstKey}: ${firstError}`;
            }
        }
    }

    // 3. Status code fallbacks
    switch (status) {
        case 400:
            return 'Bad request. Please check your inputs.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 404:
            return 'The requested resource was not found.';
        case 500:
            return 'Internal server error. Please try again later.';
        default:
            return `An unexpected error occurred (Code: ${status}).`;
    }
}
