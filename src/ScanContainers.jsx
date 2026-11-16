import { useState } from "react";

const PREFIXES = ['ts', 'cs', 'plt', 'bin']

export default function isValidContainerType(id) {
    if ('AMNESTYUNSEL' === id) {
        return true
    }

    if ('AMNESTYDESEL' === id) {
        return true
    }

    for (const prefix of PREFIXES) {
        if (id.startsWith(prefix)) {
            return true;
        }
    }

    return false;
}