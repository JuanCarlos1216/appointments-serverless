import type { APIGatewayProxyHandler } from 'aws-lambda';
import fs from 'fs';
import path from 'path';

export const http: APIGatewayProxyHandler = async () => {
    const filePath = path.join(process.cwd(), 'openapi.yml');

    const yamlContent = fs.readFileSync(filePath, 'utf8');

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/yaml',
        },
        body: yamlContent,
    };
};
