import nock from 'nock';
import { handler } from '../src';
import clientSearchPage from './mocks/http-responses/client-search-page';
import clientDetailPage from './mocks/http-responses/client-detail-page';

describe('handler', () => {
    beforeEach(() => {
        nock.cleanAll();
    });

    it("should successfully execute the extraction of client and PCA data #integration", async () => {
        const clientPageRequest = nock(`${process.env.BPSAUDE_ENDPOINT}`)
            .post('/Transparencia/Home/PesquisaOrgao')
            .reply(200, clientSearchPage);

        const clientDetailPageRequest = nock(`${process.env.BPSAUDE_ENDPOINT}`)
            .get('/Transparencia/orgao/28864900000104')
            .reply(200, clientDetailPage);

        await handler({ clientName: 'cliente de testes' });

        expect(clientPageRequest.isDone()).toEqual(true);
        expect(clientDetailPageRequest.isDone()).toEqual(true);
    });

    it("should return an error when the client page is unavailable #integration", async () => {
        const clientPageRequest = nock(`${process.env.BPSAUDE_ENDPOINT}`)
            .post('/Transparencia/Home/PesquisaOrgao')
            .reply(500, {});

        await expect(handler({ clientName: 'cliente de testes' })).rejects.toThrow('fail to extract PCAs');
        expect(clientPageRequest.isDone()).toEqual(true);
    });

    it("should return an error when the client detail page is unavailable #integration", async () => {
        const clientPageRequest = nock(`${process.env.BPSAUDE_ENDPOINT}`)
            .post('/Transparencia/Home/PesquisaOrgao')
            .reply(200, clientSearchPage);

        const clientDetailPageRequest = nock(`${process.env.BPSAUDE_ENDPOINT}`)
            .get('/Transparencia/orgao/28864900000104')
            .reply(500, clientDetailPage);

        await expect(handler({ clientName: 'cliente de testes' })).rejects.toThrow('fail to extract PCAs');
        expect(clientPageRequest.isDone()).toEqual(true);
        expect(clientDetailPageRequest.isDone()).toEqual(true);
    });
})