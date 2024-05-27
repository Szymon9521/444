import fastify from "fastify";
import fetch from 'node-fetch';
import UrlBuilder from "../url/UrlBuilder.js";
import { UrlList } from '../url/UrlList.js'

type FastifyParameters = {
    id: string;
}

type ApiResponse = {
    data: {
        token: string;
    };
}

export default class testowa {
    private urlBuilder!: UrlBuilder;

    private getUrl(): string {
        return this.urlBuilder.getUrl();
    }

    constructor(private fastifyInstance: fastify.FastifyInstance, private endpoint: string) {
        this.fastifyInstance.get<{ Params: FastifyParameters }>(`/${this.endpoint}/:id`, this.handleRequest.bind(this));
    }

    private async handleRequest(request: fastify.FastifyRequest<{ Params: FastifyParameters }>, reply: fastify.FastifyReply): Promise<void> {
        const serverId = request.params.id;
        
        try {

            this.urlBuilder = new UrlBuilder(UrlList.pterodactyl, `client/servers/${serverId}/websocket`);

            const response = await fetch(this.getUrl(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ptlc_4x6pptELQgtwoaNShxvdNbYbyIfO7EuCWCk8PENOsmJ',
                },
            });

            if (!response.ok) {
                reply.code(response.status).send({ error: 'Failed to fetch data' });
                return;
            }

            const jsonResponse = await response.json() as ApiResponse;
            reply.send(jsonResponse.data.token);
        } catch (error) {
            console.error('Error fetching data:', error);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
}