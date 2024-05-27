import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fetch from 'node-fetch';
import UrlBuilder from '../url/UrlBuilder.js';
import { UrlList } from '../url/UrlList.js';

type FastifyParameters = {
    id: string;
}

type ApiResponse = {
    data: {
        token: string;
    };
}

export default class Testowa {
    private urlBuilder!: UrlBuilder;

    private getUrl(): string {
        return this.urlBuilder.getUrl();
    }

    constructor(private fastifyInstance: FastifyInstance, private endpoint: string) {
        this.fastifyInstance.get<{ Params: FastifyParameters }>(`/${this.endpoint}/:id`, this.handleRequest.bind(this));
    }

    private async handleRequest(request: FastifyRequest<{ Params: FastifyParameters }>, reply: FastifyReply): Promise<void> {
        const serverId = request.params.id;

        try {
            this.urlBuilder = new UrlBuilder(UrlList.pterodactyl, `client/servers/${serverId}/websocket`);

            const response = await fetch(this.getUrl(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer klucz',
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
