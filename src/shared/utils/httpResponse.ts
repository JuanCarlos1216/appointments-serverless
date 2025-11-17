export function success(statusCode: number, data: unknown) {
    return {
        statusCode,
        body: JSON.stringify(data),
    };
}

export function failure(statusCode: number, message: string) {
    return {
        statusCode,
        body: JSON.stringify({ message }),
    };
}
