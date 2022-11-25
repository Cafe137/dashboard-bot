import { System } from 'cafe-utility'
import fetch from 'node-fetch'

export class Server {
    async start() {
        return new Promise(resolve => {
            System.runProcess(
                'npx',
                ['cafe-tui', 'fake-bee', '--instant-stamp', '--instant-usable'],
                { env: process.env },
                buffer => {
                    process.stdout.write(buffer.toString())
                    if (buffer.includes('Up and running')) {
                        resolve()
                    }
                },
                buffer => process.stderr.write(buffer.toString())
            )
        })
    }

    async getNextBatchId() {
        return await (await fetch('http://localhost:1633/meta/nextStamp')).text()
    }

    async close() {
        await fetch('http://localhost:1633/meta/server', { method: 'DELETE' }).catch(() => {})
    }
}
