import { APIGatewayProxyResult } from "aws-lambda";

export const headers: APIGatewayProxyResult["headers"] = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
}
