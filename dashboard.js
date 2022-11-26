import { Strings, System } from 'cafe-utility'

const url = 'https://github.com/ethersphere/bee-dashboard/archive/refs/heads/fix/ultra-light-node-execution-order.zip'
const path = 'bee-dashboard-fix-ultra-light-node-execution-order'

export class Dashboard {
    abortController = new AbortController()

    async start() {
        await System.runProcess('npx', ['cafe-tui', 'get-unzip', url, '.'], { env: process.env })
        await System.runProcess('npm', ['install', '--ignore-scripts'], { env: process.env, cwd: path })
        await System.runProcess('npm', ['run', 'build'], {
            env: {
                ...process.env,
                REACT_APP_BEE_DESKTOP_URL: 'http://localhost:3054',
                REACT_APP_BEE_DESKTOP_ENABLED: 'true'
            },
            cwd: path
        })
        return new Promise(async resolve => {
            System.runProcess(
                'npx',
                ['serve', '-p', '3002'],
                {
                    env: process.env,
                    cwd: Strings.joinUrl(path, 'build'),
                    signal: this.abortController.signal
                },
                buffer => {
                    process.stdout.write(buffer.toString())
                    if (buffer.includes('3002')) {
                        resolve()
                    }
                }
            )
        })
    }

    async close() {
        this.abortController.abort()
    }
}
