import { describe, before, after, it } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert'

const BASE_URL = 'http://localhost:9800'

describe('API Workflow', () => {
    let _server = {}
    let _globaToken = ''
    before(async () => {
        _server = (await import('./api.js')).app
        await new Promise(resolve => _server.once('listening', resolve))
    })

    after(done => _server.close(done))

    it('should receive not authorized given wrong user and password', async () => {
        const data = {
            user: 'jovasd3v',
            password: ''
        }
        const request = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            body: JSON.stringify(data)
        })

        strictEqual(request.status, 401)
        const response = await request.json()
        deepStrictEqual(response, { error: 'user invalid!' })
    })

    it('should login successfuly given user and password', async () => {
        const data = {
            user: 'jovasd3v',
            password: 'root'
        }
        const request = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            body: JSON.stringify(data),
        })

        deepStrictEqual(request.status, 200)
        const response = await request.json()
        ok(response.token, "token should be present")
        _globaToken = response.token
    })

    it('should not be a allowed to acess provate data without a token', async () => {
        const request = await fetch(`${BASE_URL}/`, {
            method: 'GET',
            headers: {
                authorization: ''
            }
        })

        deepStrictEqual(request.status, 400)
        const response = await request.json()
        deepStrictEqual(response, { error: 'invalid token!' })
    })

    it('should be a allowed to acess provate data with a valid token', async () => {
        const request = await fetch(`${BASE_URL}/`, {
            method: 'GET',
            headers: {
                authorization: _globaToken
            }
        })

        deepStrictEqual(request.status, 200)
        const response = await request.json()
        deepStrictEqual(response, { result: 'Hey welcome!' })
    })
})
