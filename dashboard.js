import { System } from 'cafe-utility'

const url = 'https://github.com/ethersphere/bee-dashboard/archive/refs/heads/fix/ultra-light-node-execution-order.zip'
const path = 'bee-dashboard-fix-ultra-light-node-execution-order'

export class Dashboard {
    async start() {
        await System.runProcess(
            'npx',
            ['cafe-tui', 'get-unzip', url, '.'],
            { env: process.env },
            buffer => process.stdout.write(buffer),
            buffer => process.stderr.write(buffer)
        )
        await System.runProcess(
            'npm',
            ['install', '--ignore-scripts'],
            { env: process.env, cwd: path },
            buffer => process.stdout.write(buffer),
            buffer => process.stderr.write(buffer)
        )
        return new Promise(async resolve => {
            await System.runProcess(
                'npm',
                ['start'],
                {
                    env: {
                        ...process.env,
                        REACT_APP_BEE_DESKTOP_URL: 'http://localhost:3054',
                        REACT_APP_BEE_DESKTOP_ENABLED: 'true'
                    },
                    cwd: path
                },
                buffer => {
                    process.stdout.write(buffer)
                    if (buffer.includes('3002')) {
                        resolve()
                    }
                },
                buffer => process.stderr.write(buffer)
            )
        })
    }

    async close() {
        await System.execAsync(
            'killall',
            ['node'],
            { env: process.env },
            buffer => process.stdout.write(buffer),
            buffer => process.stderr.write(buffer)
        )
    }
}
