import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SNSClient } from '@aws-sdk/client-sns';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';

const region = process.env.AWS_REGION || 'us-east-1';

export const dynamoClient = new DynamoDBClient({ region });
export const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);
export const snsClient = new SNSClient({ region });
export const eventBridgeClient = new EventBridgeClient({ region });
