"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiKeyAuth_1 = require("../../src/middleware/apiKeyAuth");
const env_1 = require("../../src/config/env");
const apiError_1 = require("../../src/utils/apiError");
describe('apiKeyAuth middleware', () => {
    const res = {};
    let next;
    beforeEach(() => {
        next = jest.fn();
        env_1.appConfig.apiKeys = ['secret-key'];
    });
    afterEach(() => {
        env_1.appConfig.apiKeys = [];
    });
    const createRequest = (headers) => ({
        header: (name) => headers[name.toLowerCase()]
    });
    it('rejects missing API key', () => {
        const req = createRequest({});
        (0, apiKeyAuth_1.apiKeyAuth)(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.any(apiError_1.ApiError));
        const error = next.mock.calls[0][0];
        expect(error.statusCode).toBe(401);
    });
    it('accepts valid x-api-key header', () => {
        const req = createRequest({ 'x-api-key': 'secret-key' });
        (0, apiKeyAuth_1.apiKeyAuth)(req, res, next);
        expect(next).toHaveBeenCalledWith();
    });
    it('accepts Bearer token in Authorization header', () => {
        const req = createRequest({ authorization: 'Bearer secret-key' });
        (0, apiKeyAuth_1.apiKeyAuth)(req, res, next);
        expect(next).toHaveBeenCalledWith();
    });
});
//# sourceMappingURL=apiKeyAuth.test.js.map